import { NextRequest, NextResponse } from "next/server";

import {
  API_BASE_URL,
  API_BROWSER_BASE_PATH,
  AUTH_ENDPOINTS,
} from "@/_network/config/endpoints";

type RouteContext = {
  params: Promise<unknown>;
};

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

  // Read body as raw bytes. request.text() UTF-8-decodes the whole body and destroys
  // multipart binary (file parts), which shows up as repeated EF BF BD on the server.
  let bodyBytes: ArrayBuffer | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    bodyBytes = await request.arrayBuffer();
  }

  const requestBody: BodyInit | undefined =
    bodyBytes && bodyBytes.byteLength > 0 ? bodyBytes : undefined;

  let proxyHeaders = await buildProxyHeaders(request);

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

  return new NextResponse(responseBuf.byteLength ? responseBuf : null, {
    status: upstreamResponse.status,
    headers: outHeaders,
  });
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