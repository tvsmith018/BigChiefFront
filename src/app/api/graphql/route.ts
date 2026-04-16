import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL, AUTH_ENDPOINTS } from "@/_network/config/endpoints";

const GRAPHQL_UPSTREAM_URL = `${API_BASE_URL}/graphql/`;

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
  const body = await request.text();
  let proxyHeaders = await buildProxyHeaders(request);

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
  const contentType = upstreamResponse.headers.get("content-type") ?? "application/json";

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: buildSecurityHeaders(contentType),
  });
}
