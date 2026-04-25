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

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = Date.now();
  const clientIp = getClientIp(request);
  const limit = clientIp
    ? consumeRateLimit(`graphql:${clientIp}`)
    : {
        allowed: true,
        remaining: GRAPHQL_RATE_LIMIT_MAX,
        resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
      };
  const hasAuthContext = Boolean(
    request.headers.get("authorization") ||
      request.cookies.get("access")?.value ||
      request.cookies.get("session")?.value
  );

  if (!limit.allowed) {
    logWarn("bff_graphql_rate_limited", { requestId, clientIp });
    return NextResponse.json(
      { detail: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          ...buildSecurityHeaders("application/json"),
          "x-request-id": requestId,
          "cache-control": CACHE_CONTROL_PRIVATE,
          "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.text();
    let proxyHeaders = await buildProxyHeaders(request);
    proxyHeaders.set("x-request-id", requestId);

    let upstreamResponse = await fetch(GRAPHQL_UPSTREAM_URL, {
      method: "POST",
      headers: proxyHeaders,
      body,
      cache: "no-store",
    });

    if (upstreamResponse.status === 401) {
      const refreshToken = request.cookies.get("session")?.value;
      if (refreshToken) {
        const refreshedAccessToken = await refreshAccessToken(refreshToken);
        if (refreshedAccessToken) {
          proxyHeaders = new Headers(proxyHeaders);
          proxyHeaders.set("authorization", `Bearer ${refreshedAccessToken}`);
          proxyHeaders.set("x-request-id", requestId);
          upstreamResponse = await fetch(GRAPHQL_UPSTREAM_URL, {
            method: "POST",
            headers: proxyHeaders,
            body,
            cache: "no-store",
          });
        }
      }
    }

    const responseText = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        ...buildSecurityHeaders(contentType),
        "x-request-id": requestId,
        "cache-control": hasAuthContext
          ? CACHE_CONTROL_PRIVATE
          : CACHE_CONTROL_PUBLIC,
      },
    });
  } catch {
    logWarn("bff_graphql_upstream_unreachable", {
      requestId,
      clientIp,
      latency_ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      { detail: "GraphQL upstream unreachable." },
      {
        status: 503,
        headers: {
          ...buildSecurityHeaders("application/json"),
          "x-request-id": requestId,
          "cache-control": CACHE_CONTROL_PRIVATE,
        },
      }
    );
  } finally {
    logInfo("bff_graphql_proxy_completed", {
      requestId,
      clientIp,
      latency_ms: Date.now() - startedAt,
      hasAuthContext,
      upstream: GRAPHQL_UPSTREAM_URL,
      rateRemaining: limit.remaining,
    });
  }
}
