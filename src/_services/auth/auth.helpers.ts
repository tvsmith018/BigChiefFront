import type { User } from "@/_types/auth/user";

export function getCookieSettings(maxAge: number, nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
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
