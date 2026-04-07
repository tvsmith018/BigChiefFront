import assert from "node:assert/strict";

import {
  AUTH_ENDPOINTS,
  API_BROWSER_BASE_PATH,
  GRAPHQL_BROWSER_PATH,
  normalizeApiBaseUrl,
  resolveApiBaseUrl,
  resolveGraphQLEndpoint,
  resolveHttpBaseUrl,
  resolveWebSocketBaseUrl,
} from "../src/_network/config/endpoints.ts";
import { HttpClient } from "../src/_network/core/HttpClient.ts";
import {
  extractUser,
  getCookieSettings,
  isAuthErrorUser,
} from "../src/_services/auth/auth.helpers.ts";

async function testEndpoints() {
  assert.equal(
    normalizeApiBaseUrl("https://example.com/graphql/"),
    "https://example.com"
  );
  assert.equal(
    normalizeApiBaseUrl("https://example.com/api///"),
    "https://example.com/api"
  );
  assert.equal(
    resolveApiBaseUrl({
      NEXT_PUBLIC_API_URL: "https://api.example.com",
      NEXT_PUBLIC_ARTICLEURL: "https://legacy.example.com/graphql/",
    }),
    "https://api.example.com"
  );
  assert.equal(
    resolveApiBaseUrl({
      NEXT_PUBLIC_ARTICLEURL: "https://legacy.example.com/graphql/",
    }),
    "https://legacy.example.com/graphql/"
  );
  assert.equal(
    resolveApiBaseUrl({}),
    "https://bigchiefnewz-a2e8434d1e6d.herokuapp.com"
  );
  assert.equal(
    resolveWebSocketBaseUrl("https://api.example.com"),
    "wss://api.example.com"
  );
  assert.equal(
    resolveWebSocketBaseUrl("http://localhost:8000"),
    "ws://localhost:8000"
  );
  assert.equal(
    resolveGraphQLEndpoint("https://api.example.com", true),
    GRAPHQL_BROWSER_PATH
  );
  assert.equal(
    resolveGraphQLEndpoint("https://api.example.com", false),
    "https://api.example.com/graphql/"
  );
  assert.equal(
    resolveHttpBaseUrl("https://api.example.com", true),
    API_BROWSER_BASE_PATH
  );
  assert.equal(
    resolveHttpBaseUrl("https://api.example.com", false),
    "https://api.example.com"
  );
  assert.equal(AUTH_ENDPOINTS.refreshToken, "/authorized/token/refresh/");
}

async function testHttpClient() {
  const originalFetch = globalThis.fetch;

  try {
    let receivedInit;

    globalThis.fetch = async (_input, init) => {
      receivedInit = init;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = new HttpClient("https://example.com");
    const successResponse = await client.request("/ping", {
      method: "POST",
      body: { hello: "world" },
    });

    assert.deepEqual(successResponse, { ok: true });
    assert.equal(receivedInit?.method, "POST");
    assert.equal(receivedInit?.credentials, "include");
    assert.equal(receivedInit?.body, JSON.stringify({ hello: "world" }));

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ detail: "bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const errorResponse = await client.request("/ping");
    assert.deepEqual(errorResponse, { detail: "bad request" });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function testAuthHelpers() {
  assert.deepEqual(getCookieSettings(3600, "production"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });

  assert.deepEqual(getCookieSettings(3600, "development"), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });

  assert.equal(extractUser(null), null);
  assert.deepEqual(
    extractUser({ data: { firstname: "Terrance", lastname: "Smith" } }),
    { firstname: "Terrance", lastname: "Smith" }
  );
  assert.deepEqual(
    extractUser({ firstname: "Big", lastname: "Chief" }),
    { firstname: "Big", lastname: "Chief" }
  );

  assert.equal(isAuthErrorUser(null), true);
  assert.equal(isAuthErrorUser({ detail: "expired" }), true);
  assert.equal(
    isAuthErrorUser({
      messages: [{ token_class: "AccessToken", token_type: "access", message: "expired" }],
    }),
    true
  );
  assert.equal(isAuthErrorUser({ firstname: "Valid" }), false);
}

async function main() {
  await testEndpoints();
  await testHttpClient();
  await testAuthHelpers();
  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error("Smoke tests failed.");
  console.error(error);
  process.exit(1);
});
