import { describe, expect, it } from "vitest";
import {
  API_BROWSER_BASE_PATH,
  AUTH_ENDPOINTS,
  GRAPHQL_BROWSER_PATH,
  PROFILE_ENDPOINTS,
  normalizeApiBaseUrl,
  resolveApiBaseUrl,
  resolveGraphQLEndpoint,
  resolveHttpBaseUrl,
  resolveWebSocketBaseUrl,
} from "./endpoints";

describe("endpoints", () => {
  function withEnv<T>(key: string, value: string, run: () => T): T {
    const previous = process.env[key];
    process.env[key] = value;
    try {
      return run();
    } finally {
      if (previous === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous;
      }
    }
  }

  it("normalizeApiBaseUrl strips graphql suffix and trailing slashes", () => {
    expect(normalizeApiBaseUrl("https://example.com/graphql/")).toBe("https://example.com");
    expect(normalizeApiBaseUrl("https://example.com/api///")).toBe("https://example.com/api");
    expect(normalizeApiBaseUrl("https://x.com/")).toBe("https://x.com");
  });

  it("resolveApiBaseUrl prefers NEXT_PUBLIC_API_URL then ARTICLEURL then default", () => {
    expect(
      resolveApiBaseUrl({
        NEXT_PUBLIC_API_URL: "https://api.example.com",
        NEXT_PUBLIC_ARTICLEURL: "https://legacy.example.com/graphql/",
      })
    ).toBe("https://api.example.com");
    expect(
      resolveApiBaseUrl({
        NEXT_PUBLIC_ARTICLEURL: "https://legacy.example.com/graphql/",
      })
    ).toBe("https://legacy.example.com/graphql/");
    expect(resolveApiBaseUrl({})).toBe("https://bigchiefnewz-a2e8434d1e6d.herokuapp.com");
    expect(resolveApiBaseUrl({ NEXT_PUBLIC_API_URL: "https://only-api.example.com" })).toBe(
      "https://only-api.example.com"
    );
  });

  it("resolveWebSocketBaseUrl maps http(s) to ws(s)", () => {
    expect(resolveWebSocketBaseUrl("https://api.example.com")).toBe("wss://api.example.com");
    expect(resolveWebSocketBaseUrl("http://localhost:8000")).toBe("ws://localhost:8000");
  });

  it("resolveGraphQLEndpoint uses browser proxy path when isBrowser", () => {
    expect(resolveGraphQLEndpoint("https://api.example.com", true)).toBe(GRAPHQL_BROWSER_PATH);
    expect(resolveGraphQLEndpoint("https://api.example.com", false)).toBe(
      "https://api.example.com/graphql/"
    );
    expect(
      withEnv("NEXT_PUBLIC_SITE_URL", "https://www.bigchiefnewz.com", () =>
        resolveGraphQLEndpoint("https://api.example.com", false)
      )
    ).toBe("https://www.bigchiefnewz.com/api/graphql");
  });

  it("resolveHttpBaseUrl uses browser proxy path when isBrowser", () => {
    expect(resolveHttpBaseUrl("https://api.example.com", true)).toBe(API_BROWSER_BASE_PATH);
    expect(resolveHttpBaseUrl("https://api.example.com", false)).toBe("https://api.example.com");
    expect(
      withEnv("NEXT_PUBLIC_SITE_URL", "www.bigchiefnewz.com", () =>
        resolveHttpBaseUrl("https://api.example.com", false)
      )
    ).toBe("https://www.bigchiefnewz.com/api/backend");
  });

  it("AUTH_ENDPOINTS has stable paths", () => {
    expect(AUTH_ENDPOINTS.refreshToken).toBe("/authorized/token/refresh/");
    expect(AUTH_ENDPOINTS.signup).toBe("/authorized/signup/");
  });

  it("PROFILE_ENDPOINTS has stable paths", () => {
    expect(PROFILE_ENDPOINTS.me).toBe("/profiles/me/");
  });
});
