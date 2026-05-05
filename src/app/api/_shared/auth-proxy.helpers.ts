import { NextRequest } from "next/server";

export async function refreshAccessToken(
  refreshEndpoint: string,
  refreshToken: string
) {
  const refreshResponse = await fetch(refreshEndpoint, {
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

export async function buildProxyHeaders(
  request: NextRequest,
  refreshEndpoint: string
) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  let accessToken = request.cookies.get("access")?.value;
  const refreshToken = request.cookies.get("session")?.value;
  const authorization = request.headers.get("authorization");

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshEndpoint, refreshToken);
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
