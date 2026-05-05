import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL, AUTH_ENDPOINTS } from "@/_network/config/endpoints";
import { logInfo, logWarn } from "@/_utilities/observability/logger";
import {
  buildJsonErrorResponse,
  buildSecurityHeaders,
  getClientIp,
  getLimitState,
  hasAuthContext,
} from "../_shared/bff.helpers";
import {
  buildProxyHeaders,
  refreshAccessToken,
} from "../_shared/auth-proxy.helpers";

const GRAPHQL_UPSTREAM_URL = `${API_BASE_URL}/graphql/`;
const RATE_LIMIT_WINDOW_MS = Number(process.env.BFF_RATE_LIMIT_WINDOW_MS ?? 60_000);
const GRAPHQL_RATE_LIMIT_MAX = Number(
  process.env.BFF_GRAPHQL_RATE_LIMIT_MAX ?? 180
);
const CACHE_CONTROL_PUBLIC = "public, s-maxage=30, stale-while-revalidate=120";
const CACHE_CONTROL_PRIVATE = "no-store";
const rateLimitState = new Map<string, { count: number; resetAt: number }>();

function buildCacheControlHeader(hasAuthContext: boolean) {
  return hasAuthContext ? CACHE_CONTROL_PRIVATE : CACHE_CONTROL_PUBLIC;
}

async function fetchGraphQlUpstream(
  body: string,
  headers: Headers
) {
  return fetch(GRAPHQL_UPSTREAM_URL, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
}

async function fetchGraphQlWithRetry(
  request: NextRequest,
  requestId: string,
  body: string,
  proxyHeaders: Headers
) {
  const upstreamResponse = await fetchGraphQlUpstream(body, proxyHeaders);
  if (upstreamResponse.status !== 401) {
    return upstreamResponse;
  }

  const refreshToken = request.cookies.get("session")?.value;
  if (!refreshToken) {
    return upstreamResponse;
  }

  const refreshedAccessToken = await refreshAccessToken(
    `${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`,
    refreshToken
  );
  if (!refreshedAccessToken) {
    return upstreamResponse;
  }

  const retryHeaders = new Headers(proxyHeaders);
  retryHeaders.set("authorization", `Bearer ${refreshedAccessToken}`);
  retryHeaders.set("x-request-id", requestId);
  return fetchGraphQlUpstream(body, retryHeaders);
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = Date.now();
  const clientIp = getClientIp(request);
  const isInternalServerRequest =
    request.headers.get("x-bff-internal-request") === "1";
  const limit = getLimitState(
    rateLimitState,
    "graphql",
    GRAPHQL_RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
    isInternalServerRequest,
    clientIp
  );
  const hasAuth = hasAuthContext(request);

  if (!limit.allowed) {
    logWarn("bff_graphql_rate_limited", { requestId, clientIp });
    return buildJsonErrorResponse(
      "Rate limit exceeded.",
      429,
      requestId,
      CACHE_CONTROL_PRIVATE,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
  }

  try {
    const body = await request.text();
    const proxyHeaders = await buildProxyHeaders(
      request,
      `${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`
    );
    proxyHeaders.set("x-request-id", requestId);

    const upstreamResponse = await fetchGraphQlWithRetry(
      request,
      requestId,
      body,
      proxyHeaders
    );

    const responseText = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        ...buildSecurityHeaders(contentType),
        "x-request-id": requestId,
        "cache-control": buildCacheControlHeader(hasAuth),
      },
    });
  } catch {
    logWarn("bff_graphql_upstream_unreachable", {
      requestId,
      clientIp,
      latency_ms: Date.now() - startedAt,
    });
    return buildJsonErrorResponse(
      "GraphQL upstream unreachable.",
      503,
      requestId,
      CACHE_CONTROL_PRIVATE
    );
  } finally {
    logInfo("bff_graphql_proxy_completed", {
      requestId,
      clientIp,
      latency_ms: Date.now() - startedAt,
      hasAuthContext: hasAuth,
      upstream: GRAPHQL_UPSTREAM_URL,
      rateRemaining: limit.remaining,
      isInternalServerRequest,
    });
  }
}
