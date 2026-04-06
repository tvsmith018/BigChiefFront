import assert from "node:assert/strict";

import { normalizeApiBaseUrl, resolveApiBaseUrl } from "../src/_network/config/endpoints.ts";
import { HttpClient } from "../src/_network/core/HttpClient.ts";

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

async function main() {
  await testEndpoints();
  await testHttpClient();
  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error("Smoke tests failed.");
  console.error(error);
  process.exit(1);
});
