import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL, AUTH_ENDPOINTS } from "@/_network/config/endpoints";
import { logInfo, logWarn } from "@/_utilities/observability/logger";

const GRAPHQL_UPSTREAM_URL = `${API_BASE_URL}/graphql/`;
const RATE_LIMIT_WINDOW_MS = Number(process.env.BFF_RATE_LIMIT_WINDOW_MS ?? 60_000);
const GRAPHQL_RATE_LIMIT_MAX = Number(
  process.env.BFF_GRAPHQL_RATE_LIMIT_MAX ?? 180
);
const CACHE_CONTROL_PUBLIC = "public, s-maxage=30, stale-while-revalidate=120";
const CACHE_CONTROL_PRIVATE = "no-store";
const rateLimitState = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim();
  return ip || null;
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitState.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: GRAPHQL_RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  existing.count += 1;
  const remaining = Math.max(GRAPHQL_RATE_LIMIT_MAX - existing.count, 0);
  const allowed = existing.count <= GRAPHQL_RATE_LIMIT_MAX;
  return { allowed, remaining, resetAt: existing.resetAt };
}

function getDefaultLimitState() {
  return {
    allowed: true,
    remaining: GRAPHQL_RATE_LIMIT_MAX,
    resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
  };
}

function getLimitState(
  isInternalServerRequest: boolean,
  clientIp: string | null
) {
  if (isInternalServerRequest || !clientIp) {
    return getDefaultLimitState();
  }
  return consumeRateLimit(`graphql:${clientIp}`);
}

async function refreshAccessToken(refreshToken: string) {
  const refreshResponse = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    return undefined;
  }

  const payload = (await refreshResponse.json()) as { access?: string };
  return payload.access;
}

async function buildProxyHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  let accessToken = request.cookies.get("access")?.value;
  const refreshToken = request.cookies.get("session")?.value;
  const authorization = request.headers.get("authorization");

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  } else if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  const signupClient = request.headers.get("x-signup-client");
  if (signupClient) {
    headers.set("x-signup-client", signupClient);
  }

  return headers;
}

function buildSecurityHeaders(contentType: string) {
  return {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  };
}

function buildCacheControlHeader(hasAuthContext: boolean) {
  return hasAuthContext ? CACHE_CONTROL_PRIVATE : CACHE_CONTROL_PUBLIC;
}

function buildJsonErrorResponse(
  detail: string,
  status: number,
  requestId: string,
  retryAfterSeconds?: number
) {
  const headers: Record<string, string> = {
    ...buildSecurityHeaders("application/json"),
    "x-request-id": requestId,
    "cache-control": CACHE_CONTROL_PRIVATE,
  };
  if (retryAfterSeconds !== undefined) {
    headers["retry-after"] = String(retryAfterSeconds);
  }

  return NextResponse.json(
    { detail },
    {
      status,
      headers,
    }
  );
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

  const refreshedAccessToken = await refreshAccessToken(refreshToken);
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
  const limit = getLimitState(isInternalServerRequest, clientIp);
  const hasAuthContext = Boolean(
    request.headers.get("authorization") ||
      request.cookies.get("access")?.value ||
      request.cookies.get("session")?.value
  );

  if (!limit.allowed) {
    logWarn("bff_graphql_rate_limited", { requestId, clientIp });
    return buildJsonErrorResponse(
      "Rate limit exceeded.",
      429,
      requestId,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
  }

  try {
    const body = await request.text();
    const proxyHeaders = await buildProxyHeaders(request);
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
        "cache-control": buildCacheControlHeader(hasAuthContext),
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
      requestId
    );
  } finally {
    logInfo("bff_graphql_proxy_completed", {
      requestId,
      clientIp,
      latency_ms: Date.now() - startedAt,
      hasAuthContext,
      upstream: GRAPHQL_UPSTREAM_URL,
      rateRemaining: limit.remaining,
      isInternalServerRequest,
    });
  }
}
