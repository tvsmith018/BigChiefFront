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

describe("endpoints", () => {
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

  it("uses production site default when no internal origin env exists", () => {
    const env = process.env as Record<string, string | undefined>;
    const nodeEnvPrevious = env.NODE_ENV;
    const internalPrevious = env.INTERNAL_APP_ORIGIN;
    const nextInternalPrevious = env.NEXT_INTERNAL_APP_ORIGIN;
    const vercelPrevious = env.VERCEL_URL;
    const sitePrevious = env.NEXT_PUBLIC_SITE_URL;
    const nextPublicVercelPrevious = env.NEXT_PUBLIC_VERCEL_URL;

    env.NODE_ENV = "production";
    delete env.INTERNAL_APP_ORIGIN;
    delete env.NEXT_INTERNAL_APP_ORIGIN;
    delete env.VERCEL_URL;
    delete env.NEXT_PUBLIC_SITE_URL;
    delete env.NEXT_PUBLIC_VERCEL_URL;

    expect(resolveGraphQLEndpoint("https://api.example.com", false)).toBe(
      "https://www.bigchiefnewz.com/api/graphql"
    );
    expect(resolveHttpBaseUrl("https://api.example.com", false)).toBe(
      "https://www.bigchiefnewz.com/api/backend"
    );

    if (nodeEnvPrevious === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = nodeEnvPrevious;
    if (internalPrevious === undefined) delete env.INTERNAL_APP_ORIGIN;
    else env.INTERNAL_APP_ORIGIN = internalPrevious;
    if (nextInternalPrevious === undefined) delete env.NEXT_INTERNAL_APP_ORIGIN;
    else env.NEXT_INTERNAL_APP_ORIGIN = nextInternalPrevious;
    if (vercelPrevious === undefined) delete env.VERCEL_URL;
    else env.VERCEL_URL = vercelPrevious;
    if (sitePrevious === undefined) delete env.NEXT_PUBLIC_SITE_URL;
    else env.NEXT_PUBLIC_SITE_URL = sitePrevious;
    if (nextPublicVercelPrevious === undefined) delete env.NEXT_PUBLIC_VERCEL_URL;
    else env.NEXT_PUBLIC_VERCEL_URL = nextPublicVercelPrevious;
  });

  it("AUTH_ENDPOINTS has stable paths", () => {
    expect(AUTH_ENDPOINTS.refreshToken).toBe("/authorized/token/refresh/");
    expect(AUTH_ENDPOINTS.signup).toBe("/authorized/signup/");
  });

  it("PROFILE_ENDPOINTS has stable paths", () => {
    expect(PROFILE_ENDPOINTS.me).toBe("/profiles/me/");
  });
});
