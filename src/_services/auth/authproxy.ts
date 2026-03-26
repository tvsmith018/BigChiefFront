// src/_auth/proxy.ts
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth_end, httpClient } from "@/_network";
import type { User } from "@/_types/auth/user";
import type { JWTToken } from "@/_utilities/datatype/Auth/types/token";

/**
 * Cookie names (matches your createSession() code)
 */
const COOKIE_REFRESH = "session"; // refresh token cookie
const COOKIE_ACCESS = "access";   // access token cookie

/**
 * Server-only: fetch current user using access token.
 * If token is expired/invalid → return null.
 */

async function fetchMe(access?: string): Promise<User | null> {
  if (!access) return null;

  // Auth MUST never be cached
  const res = await httpClient.request<User>(
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

  // Your httpClient seems to sometimes return {details: ...} on errors
  if (!res) return null;
  if (res?.data?.detail) return null;

  // // If your API returns {data: user}, unwrap. Otherwise treat as user directly.
  const user = (res?.data ?? res) as User;

  // // Quick sanity check (optional)
  if (!user || typeof user !== "object") return null;

  return user;
}

/**
 * Server-only: refresh access token using refresh cookie.
 */
async function refreshAccess(refresh: string): Promise<string | null> {

  const res_raw  = await httpClient.request<JWTToken>(
    "/authorized/token/refresh/",
    {
      method: "POST",
      body: { refresh: refresh },
    },
    { cache: "no-store" }
  )
  const res = res_raw as JWTToken
  
  if (res.detail) return null

  return res.access ?? null
}

/**
 * 🔑 Main entry: returns { user, accessRefreshed }
 */
export async function authProxy(): Promise<{ user: User | null; accessRefreshed: boolean }> {
  const cookieStore = await cookies();
  let refresh_bool:boolean = false;

  const refresh = cookieStore.get(COOKIE_REFRESH)?.value;
  let access = cookieStore.get(COOKIE_ACCESS)?.value;

  // no refresh cookie = not logged in
  if (!refresh) return { user: null, accessRefreshed: refresh_bool };

  // in case of no access
  if (!access) {
    const new_access = await refreshAccess(refresh)
    refresh_bool = true;

    if (!new_access) return { user: null, accessRefreshed: refresh_bool }
      cookieStore.set(COOKIE_ACCESS, new_access, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day (match your accessExpiresAt)
    })
  }

  const user = await fetchMe(access);

  /** Access Expired*/ 
  if (user?.detail){
    const new_access = await refreshAccess(refresh);
    refresh_bool = true;
    if (!new_access) return { user: null, accessRefreshed: refresh_bool}
    cookieStore.set(COOKIE_ACCESS, new_access, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day (match your accessExpiresAt)
    })
  }


  return { user: user, accessRefreshed: refresh_bool}
}

/**
 * ✅ Use on PROTECTED routes
 * If not logged in → redirect("/auth")
 */
export async function requireAuth(redirectTo: string = "/auth") {
  const { user } = await authProxy();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * ✅ Use on GUEST routes like /auth
 * If logged in → redirect("/")
 */
export async function requireGuest(redirectTo: string = "/") {
  const { user } = await authProxy();
  if (user) redirect(redirectTo);
}