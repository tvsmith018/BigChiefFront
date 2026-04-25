const DEFAULT_API_BASE_URL = "https://bigchiefnewz-a2e8434d1e6d.herokuapp.com";
export const GRAPHQL_BROWSER_PATH = "/api/graphql";
export const API_BROWSER_BASE_PATH = "/api/backend";

function normalizeOriginCandidate(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function resolveInternalAppOrigin(
  env: Record<string, string | undefined> = process.env
) {
  const productionDefaultSiteOrigin =
    env.NODE_ENV === "production"
      ? normalizeOriginCandidate("https://www.bigchiefnewz.com")
      : undefined;

  return (
    normalizeOriginCandidate(env.INTERNAL_APP_ORIGIN) ??
    normalizeOriginCandidate(env.NEXT_INTERNAL_APP_ORIGIN) ??
    normalizeOriginCandidate(env.VERCEL_URL) ??
    normalizeOriginCandidate(env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOriginCandidate(env.NEXT_PUBLIC_VERCEL_URL) ??
    productionDefaultSiteOrigin
  );
}

export function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/graphql\/?$/, "").replace(/\/+$/, "");
}

export function resolveWebSocketBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}

export function resolveApiBaseUrl(
  env: Record<string, string | undefined> = process.env
) {
  return (
    env.NEXT_PUBLIC_API_URL ??
    env.NEXT_PUBLIC_ARTICLEURL ??
    DEFAULT_API_BASE_URL
  );
}

export function resolveGraphQLEndpoint(
  apiBaseUrl: string,
  isBrowser: boolean = typeof window !== "undefined"
) {
  if (isBrowser) {
    return GRAPHQL_BROWSER_PATH;
  }

  const origin = resolveInternalAppOrigin();
  if (!origin) {
    return `${normalizeApiBaseUrl(apiBaseUrl)}/graphql/`;
  }
  return `${origin}${GRAPHQL_BROWSER_PATH}`;
}

export function resolveHttpBaseUrl(
  apiBaseUrl: string,
  isBrowser: boolean = typeof window !== "undefined"
) {
  if (isBrowser) {
    return API_BROWSER_BASE_PATH;
  }

  const origin = resolveInternalAppOrigin();
  if (!origin) {
    return normalizeApiBaseUrl(apiBaseUrl);
  }
  return `${origin}${API_BROWSER_BASE_PATH}`;
}

export const API_BASE_URL = normalizeApiBaseUrl(resolveApiBaseUrl());
export const GRAPHQL_URL = resolveGraphQLEndpoint(API_BASE_URL);
export const WEBSOCKET_BASE_URL = resolveWebSocketBaseUrl(API_BASE_URL);

export const AUTH_ENDPOINTS = {
  otp: "/authorized/otp/",
  resetPassword: "/authorized/reset-password/",
  checkExistence: "/authorized/check-email/",
  signup: "/authorized/signup/",
  refreshToken: "/authorized/token/refresh/",
};

export const PROFILE_ENDPOINTS = {
  me: "/profiles/me/",
};
