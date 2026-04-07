import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL, API_BROWSER_BASE_PATH } from "@/_network/config/endpoints";

type RouteContext = {
  params: Promise<unknown>;
};

function buildUpstreamUrl(request: NextRequest) {
  let upstreamPath = request.nextUrl.pathname.replace(
    new RegExp(`^${API_BROWSER_BASE_PATH}`),
    ""
  );
  const search = request.nextUrl.search;

  // Django routes in this backend use trailing slashes. Next route pathnames
  // can arrive normalized without the terminal slash, so restore it here.
  if (!upstreamPath.endsWith("/")) {
    upstreamPath = `${upstreamPath}/`;
  }

  return `${API_BASE_URL}${upstreamPath}${search}`;
}

function buildProxyHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (authorization) {
    headers.set("authorization", authorization);
  }

  return headers;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  await context.params;
  const upstreamUrl = buildUpstreamUrl(request);
  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: buildProxyHeaders(request),
    body: requestBody,
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "content-type":
        upstreamResponse.headers.get("content-type") ?? "application/json",
    },
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
