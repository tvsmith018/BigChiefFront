import { describe, expect, it, vi, afterEach } from "vitest";
import { HttpClient } from "./HttpClient";

function asHeaders(input: RequestInit["headers"]): Headers {
  return input instanceof Headers ? input : new Headers(input);
}

function requestInputToUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

describe("HttpClient", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("JSON POST stringifies body and sets Content-Type", async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, requestInit?: RequestInit) => {
      init = requestInit;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const client = new HttpClient("https://example.com");
    const res = await client.request("/ping", {
      method: "POST",
      body: { hello: "world" },
    });

    expect(res).toEqual({ ok: true });
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("include");
    expect(init?.body).toBe(JSON.stringify({ hello: "world" }));
    const headers = asHeaders(init?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("FormData sends raw body and does not force application/json", async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, requestInit?: RequestInit) => {
      init = requestInit;
      return new Response(JSON.stringify({ data: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const client = new HttpClient("https://example.com");
    const fd = new FormData();
    fd.append("a", "b");
    await client.request("/up", {
      method: "POST",
      body: fd,
      headers: { "X-Client": "web" },
    });

    expect(init?.body).toBe(fd);
    const headers = asHeaders(init?.headers);
    expect(headers.get("Content-Type")).toBeNull();
    expect(headers.get("X-Client")).toBe("web");
  });

  it("returns parsed error body on non-ok JSON responses", async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ detail: "bad" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const client = new HttpClient("https://example.com");
    const err = await client.request("/x");
    expect(err).toEqual({ detail: "bad" });
  });

  it("throws when non-ok and response body is empty or non-object JSON", async () => {
    globalThis.fetch = vi.fn(async () => new Response("", { status: 500 })) as typeof fetch;

    const client = new HttpClient("https://example.com");
    await expect(client.request("/x")).rejects.toThrow(/Request failed with status 500/);
  });

  it("parses null for empty 200 body", async () => {
    globalThis.fetch = vi.fn(async () => new Response("", { status: 200 })) as typeof fetch;

    const client = new HttpClient("https://example.com");
    const res = await client.request("/empty");
    expect(res).toBeNull();
  });

  it("uses dynamic baseUrl when constructor receives a function", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestInputToUrl(input)).toContain("https://dynamic.example.com");
      return new Response(JSON.stringify({ ok: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const client = new HttpClient(() => "https://dynamic.example.com");
    const res = await client.request("/z");
    expect(res).toEqual({ ok: 1 });
  });
});
