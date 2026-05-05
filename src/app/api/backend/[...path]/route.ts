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

function getDefaultLimitState() {
  return {
    allowed: true,
    remaining: BACKEND_RATE_LIMIT_MAX,
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
  return consumeRateLimit(`backend:${clientIp}`);
}

function buildSecurityHeaders(contentType: string) {
  return {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  };
}

function buildCacheControlHeader(
  method: string,
  hasAuthContext: boolean
) {
  return method === "GET" && !hasAuthContext
    ? CACHE_CONTROL_PUBLIC
    : CACHE_CONTROL_PRIVATE;
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

async function getRequestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  // Read body as raw bytes. request.text() UTF-8-decodes the whole body and destroys
  // multipart binary (file parts), which shows up as repeated EF BF BD on the server.
  const bodyBytes = await request.arrayBuffer();
  return bodyBytes.byteLength > 0 ? bodyBytes : undefined;
}

async function fetchUpstream(
  upstreamUrl: string,
  request: NextRequest,
  headers: Headers,
  body: BodyInit | undefined
) {
  return fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
}

async function retryUnauthorizedRequest(
  request: NextRequest,
  requestId: string,
  upstreamUrl: string,
  response: Response,
  proxyHeaders: Headers,
  requestBody: BodyInit | undefined
) {
  if (response.status !== 401) {
    return response;
  }

  const refreshToken = request.cookies.get("session")?.value;
  if (!refreshToken) {
    return response;
  }

  const refreshedAccessToken = await refreshAccessToken(refreshToken);
  if (!refreshedAccessToken) {
    return response;
  }

  const retryHeaders = new Headers(proxyHeaders);
  retryHeaders.set("authorization", `Bearer ${refreshedAccessToken}`);
  retryHeaders.set("x-request-id", requestId);

  return fetchUpstream(upstreamUrl, request, retryHeaders, requestBody);
}

function buildProxyResponseHeaders(
  contentType: string | null,
  requestId: string,
  cacheControl: string
) {
  const outHeaders = new Headers();
  if (contentType) {
    outHeaders.set("content-type", contentType);
  }
  outHeaders.set("x-content-type-options", "nosniff");
  outHeaders.set("x-frame-options", "DENY");
  outHeaders.set("referrer-policy", "strict-origin-when-cross-origin");
  outHeaders.set("x-request-id", requestId);
  outHeaders.set("cache-control", cacheControl);
  return outHeaders;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  await context.params;
  const upstreamUrl = buildUpstreamUrl(request);
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const startedAt = Date.now();
  const clientIp = getClientIp(request);
  const isInternalServerRequest =
    request.headers.get("x-bff-internal-request") === "1";
  const hasAuthContext = Boolean(
    request.headers.get("authorization") ||
      request.cookies.get("access")?.value ||
      request.cookies.get("session")?.value
  );
  const limit = getLimitState(isInternalServerRequest, clientIp);

  if (!limit.allowed) {
    logWarn("bff_backend_rate_limited", {
      requestId,
      clientIp,
      method: request.method,
      path: request.nextUrl.pathname,
    });
    return buildJsonErrorResponse(
      "Rate limit exceeded.",
      429,
      requestId,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
  }

  try {
    const requestBody = await getRequestBody(request);

    const proxyHeaders = await buildProxyHeaders(request);
    proxyHeaders.set("x-request-id", requestId);

    const upstreamResponse = await fetchUpstream(
      upstreamUrl,
      request,
      proxyHeaders,
      requestBody
    );
    const finalResponse = await retryUnauthorizedRequest(
      request,
      requestId,
      upstreamUrl,
      upstreamResponse,
      proxyHeaders,
      requestBody
    );

    const responseBuf = await finalResponse.arrayBuffer();
    const outHeaders = buildProxyResponseHeaders(
      finalResponse.headers.get("content-type"),
      requestId,
      buildCacheControlHeader(request.method, hasAuthContext)
    );

    const response = new NextResponse(responseBuf.byteLength ? responseBuf : null, {
      status: finalResponse.status,
      headers: outHeaders,
    });
    logInfo("bff_backend_proxy_completed", {
      requestId,
      clientIp,
      method: request.method,
      path: request.nextUrl.pathname,
      upstream: upstreamUrl,
      status: finalResponse.status,
      latency_ms: Date.now() - startedAt,
      hasAuthContext,
      rateRemaining: limit.remaining,
      isInternalServerRequest,
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
    return buildJsonErrorResponse(
      "Upstream API unreachable.",
      503,
      requestId
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