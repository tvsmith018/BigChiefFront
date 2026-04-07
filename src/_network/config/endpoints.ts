const DEFAULT_API_BASE_URL = "https://bigchiefnewz-a2e8434d1e6d.herokuapp.com";
export const GRAPHQL_BROWSER_PATH = "/api/graphql";
export const API_BROWSER_BASE_PATH = "/api/backend";

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

  return `${normalizeApiBaseUrl(apiBaseUrl)}/graphql/`;
}

export function resolveHttpBaseUrl(
  apiBaseUrl: string,
  isBrowser: boolean = typeof window !== "undefined"
) {
  if (isBrowser) {
    return API_BROWSER_BASE_PATH;
  }

  return normalizeApiBaseUrl(apiBaseUrl);
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
