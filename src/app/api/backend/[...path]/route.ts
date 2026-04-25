import { NextRequest, NextResponse } from "next/server";

import {
  API_BASE_URL,
  API_BROWSER_BASE_PATH,
  AUTH_ENDPOINTS,
} from "@/_network/config/endpoints";
import { logInfo, logWarn } from "@/_utilities/observability/logger";

type RouteContext = {
  params: Promise<unknown>;
};

const RATE_LIMIT_WINDOW_MS = Number(process.env.BFF_RATE_LIMIT_WINDOW_MS ?? 60_000);
const BACKEND_RATE_LIMIT_MAX = Number(
  process.env.BFF_BACKEND_RATE_LIMIT_MAX ?? 240
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
    return { allowed: true, remaining: BACKEND_RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  existing.count += 1;
  const remaining = Math.max(BACKEND_RATE_LIMIT_MAX - existing.count, 0);
  const allowed = existing.count <= BACKEND_RATE_LIMIT_MAX;
  return { allowed, remaining, resetAt: existing.resetAt };
}

function buildUpstreamUrl(request: NextRequest) {
  let upstreamPath = request.nextUrl.pathname.replace(
    new RegExp(`^${API_BROWSER_BASE_PATH}`),
    ""
  );
  const search = request.nextUrl.search;

  if (!upstreamPath.endsWith("/")) {
    upstreamPath = `${upstreamPath}/`;
  }

  return `${API_BASE_URL}${upstreamPath}${search}`;
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

async function proxyRequest(request: NextRequest, context: RouteContext) {
  await context.params;
  const upstreamUrl = buildUpstreamUrl(request);
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = Date.now();
  const clientIp = getClientIp(request);
  const hasAuthContext = Boolean(
    request.headers.get("authorization") ||
      request.cookies.get("access")?.value ||
      request.cookies.get("session")?.value
  );
  const limit = clientIp
    ? consumeRateLimit(`backend:${clientIp}`)
    : {
        allowed: true,
        remaining: BACKEND_RATE_LIMIT_MAX,
        resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
      };

  if (!limit.allowed) {
    logWarn("bff_backend_rate_limited", {
      requestId,
      clientIp,
      method: request.method,
      path: request.nextUrl.pathname,
    });
    return NextResponse.json(
      { detail: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "strict-origin-when-cross-origin",
          "x-request-id": requestId,
          "cache-control": CACHE_CONTROL_PRIVATE,
          "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    // Read body as raw bytes. request.text() UTF-8-decodes the whole body and destroys
    // multipart binary (file parts), which shows up as repeated EF BF BD on the server.
    let bodyBytes: ArrayBuffer | null = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      bodyBytes = await request.arrayBuffer();
    }

    const requestBody: BodyInit | undefined =
      bodyBytes && bodyBytes.byteLength > 0 ? bodyBytes : undefined;

    let proxyHeaders = await buildProxyHeaders(request);
    proxyHeaders.set("x-request-id", requestId);

    let upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: requestBody,
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

          upstreamResponse = await fetch(upstreamUrl, {
            method: request.method,
            headers: proxyHeaders,
            body: requestBody,
            cache: "no-store",
          });
        }
      }
    }

    const responseBuf = await upstreamResponse.arrayBuffer();
    const outHeaders = new Headers();
    const ct = upstreamResponse.headers.get("content-type");
    if (ct) {
      outHeaders.set("content-type", ct);
    }
    outHeaders.set("x-content-type-options", "nosniff");
    outHeaders.set("x-frame-options", "DENY");
    outHeaders.set("referrer-policy", "strict-origin-when-cross-origin");
    outHeaders.set("x-request-id", requestId);
    outHeaders.set(
      "cache-control",
      request.method === "GET" && !hasAuthContext
        ? CACHE_CONTROL_PUBLIC
        : CACHE_CONTROL_PRIVATE
    );

    const response = new NextResponse(responseBuf.byteLength ? responseBuf : null, {
      status: upstreamResponse.status,
      headers: outHeaders,
    });
    logInfo("bff_backend_proxy_completed", {
      requestId,
      clientIp,
      method: request.method,
      path: request.nextUrl.pathname,
      upstream: upstreamUrl,
      status: upstreamResponse.status,
      latency_ms: Date.now() - startedAt,
      hasAuthContext,
      rateRemaining: limit.remaining,
    });
    return response;
  } catch {
    logWarn("bff_backend_upstream_unreachable", {
      requestId,
      clientIp,
      method: request.method,
      path: request.nextUrl.pathname,
      upstream: upstreamUrl,
      latency_ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      { detail: "Upstream API unreachable." },
      {
        status: 503,
        headers: {
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "strict-origin-when-cross-origin",
          "x-request-id": requestId,
          "cache-control": CACHE_CONTROL_PRIVATE,
        },
      }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}