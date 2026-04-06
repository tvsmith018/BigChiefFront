const DEFAULT_API_BASE_URL = "https://bigchiefnewz-a2e8434d1e6d.herokuapp.com";

export function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/graphql\/?$/, "").replace(/\/+$/, "");
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

export const API_BASE_URL = normalizeApiBaseUrl(resolveApiBaseUrl());
export const GRAPHQL_URL = `${API_BASE_URL}/graphql/`;

export const AUTH_ENDPOINTS = {
  otp: "/authorized/otp/",
  resetPassword: "/authorized/reset-password/",
  checkExistence: "/authorized/check-email/",
  signup: "/authorized/signup/",
  refreshToken: "/authorized/api/token/refresh/",
};
