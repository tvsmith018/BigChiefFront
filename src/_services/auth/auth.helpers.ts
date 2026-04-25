import type { User } from "@/_types/auth/user";
import type { OTPResponse } from "@/_types/auth/otp/otpresponse";

export function getCookieSettings(maxAge: number, nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * True when the API returned an auth/JWT error (not our `{ success: true, data }` envelope).
 * Avoid treating arbitrary `detail` as failure — that breaks on throttling and other DRF shapes.
 */
export function isApiAuthFailure(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (p.success === true) return false;
  if (p.code === "token_not_valid") return true;
  if (Array.isArray(p.messages)) {
    // JWT libraries usually emit auth metadata in `messages[]`.
    const first = p.messages[0];
    if (first && typeof first === "object") {
      const msg = first as Record<string, unknown>;
      if (msg.token_type || msg.token_class || msg.message) return true;
    }
  }
  if (typeof p.detail === "string") {
    const detail = p.detail.toLowerCase();
    if (
      detail.includes("token") ||
      detail.includes("not authenticated") ||
      detail.includes("authentication credentials") ||
      detail.includes("invalid credentials")
    ) {
      return true;
    }
  }
  if (p.status === 401 || p.status_code === 401) {
    return true;
  }
  return false;
}

export function extractUser(payload: User | { data?: User } | null | undefined): User | null {
  if (!payload) return null;
  if ("data" in payload && payload.data) return payload.data;
  return payload as User;
}


export function isAuthErrorUser(user: User | null) {
  if (!user) return true;
  return "detail" in user || "messages" in user;
}


export function normalizeOtp(resp: OTPResponse) {
  const code = resp.data;
  return { code, message: resp.message };
}

export function readOtp(formData: FormData) {
  let otp = "";
  for (let i = 0; i <= 5; i++) otp += String(formData.get(`texbox-${i}`) ?? "");
  return otp;
}
