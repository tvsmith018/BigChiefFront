import { NextRequest, NextResponse } from "next/server";

import { API_BASE_URL } from "@/_network/config/endpoints";

const GRAPHQL_UPSTREAM_URL = `${API_BASE_URL}/graphql/`;

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

export async function POST(request: NextRequest) {
  const body = await request.text();

  const upstreamResponse = await fetch(GRAPHQL_UPSTREAM_URL, {
    method: "POST",
    headers: buildProxyHeaders(request),
    body,
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
