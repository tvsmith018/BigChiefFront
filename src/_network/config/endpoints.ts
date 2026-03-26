export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
export const GRAPHQL_URL = `${API_BASE_URL}/graphql/`;

export const AUTH_ENDPOINTS = {
  otp: "/authorized/otp/",
  resetPassword: "/authorized/reset-password/",
  checkExistence: "/authorized/check-email/",
  signup: "/authorized/signup/",
};