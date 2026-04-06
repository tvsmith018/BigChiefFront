const DEFAULT_API_BASE_URL = "https://bigchiefnewz-a2e8434d1e6d.herokuapp.com";

function normalizeApiBaseUrl(value: string) {
  return value.replace(/\/graphql\/?$/, "").replace(/\/+$/, "");
}

const rawApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_ARTICLEURL ??
  DEFAULT_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
export const GRAPHQL_URL = `${API_BASE_URL}/graphql/`;

export const AUTH_ENDPOINTS = {
  otp: "/authorized/otp/",
  resetPassword: "/authorized/reset-password/",
  checkExistence: "/authorized/check-email/",
  signup: "/authorized/signup/",
  refreshToken: "/authorized/api/token/refresh/",
};
