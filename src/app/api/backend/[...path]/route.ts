import { NextRequest, NextResponse } from "next/server";

import {
  API_BASE_URL,
  API_BROWSER_BASE_PATH,
  AUTH_ENDPOINTS,
} from "@/_network/config/endpoints";
import { logInfo, logWarn } from "@/_utilities/observability/logger";
import {
  buildJsonErrorResponse,
  buildSecurityHeaders,
  getClientIp,
  getLimitState,
  hasAuthContext,
} from "../../_shared/bff.helpers";
import {
  buildProxyHeaders,
  refreshAccessToken,
} from "../../_shared/auth-proxy.helpers";

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

function buildCacheControlHeader(
  method: string,
  hasAuthContext: boolean
) {
  return method === "GET" && !hasAuthContext
    ? CACHE_CONTROL_PUBLIC
    : CACHE_CONTROL_PRIVATE;
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

  const refreshedAccessToken = await refreshAccessToken(
    `${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`,
    refreshToken
  );
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
  const hasAuth = hasAuthContext(request);
  const limit = getLimitState(
    rateLimitState,
    "backend",
    BACKEND_RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
    isInternalServerRequest,
    clientIp
  );

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
      CACHE_CONTROL_PRIVATE,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
  }

  try {
    const requestBody = await getRequestBody(request);

    const proxyHeaders = await buildProxyHeaders(
      request,
      `${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`
    );
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
      buildCacheControlHeader(request.method, hasAuth)
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
      hasAuthContext: hasAuth,
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
      requestId,
      CACHE_CONTROL_PRIVATE
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