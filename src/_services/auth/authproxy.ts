import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth_end, httpClient } from "@/_network";
import type { User } from "@/_types/auth/user";
import type { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { extractUser, getCookieSettings, isAuthErrorUser } from "./auth.helpers";

const COOKIE_REFRESH = "session";
const COOKIE_ACCESS = "access";
const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24;

async function fetchMe(access?: string): Promise<User | null> {
  if (!access) return null;

  const res = await httpClient.request<User | { data?: User }>(
    "/authorized/me/",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    },
    { cache: "no-store" }
  );

  const user = extractUser(res);
  if (!user || typeof user !== "object") return null;
  if (isAuthErrorUser(user)) return null;

  return user;
}

async function refreshAccess(refresh: string): Promise<string | null> {
  const res = await httpClient.request<JWTToken>(
    auth_end.refreshToken,
    {
      method: "POST",
      body: { refresh },
    },
    { cache: "no-store" }
  );

  if (!res || res.detail || !res.access) return null;

  return res.access;
}

export async function authProxy(): Promise<User | null> {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(COOKIE_REFRESH)?.value;
  let access = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!refresh) return null;

  try {
    if (!access) {
      access = await refreshAccess(refresh) ?? undefined;
      if (!access) return null;
      cookieStore.set(COOKIE_ACCESS, access, getCookieSettings(ACCESS_MAX_AGE_SECONDS));
    }

    const user = await fetchMe(access);
    if (user) return user;

    access = await refreshAccess(refresh) ?? undefined;
    if (!access) return null;

    cookieStore.set(COOKIE_ACCESS, access, getCookieSettings(ACCESS_MAX_AGE_SECONDS));
    return await fetchMe(access);
  } catch {
    return null;
  }
}

export async function requireAuth(redirectTo: string = "/auth") {
  const user = await authProxy();
  if (!user) redirect(redirectTo);
  return user;
}

export async function requireGuest(redirectTo: string = "/") {
  const user = await authProxy();
  if (user) redirect(redirectTo);
}
