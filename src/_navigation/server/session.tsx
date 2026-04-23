"use server";

import { cookies } from "next/headers";

import { API_BASE_URL, AUTH_ENDPOINTS } from "@/_network/config/endpoints";
import { getCookieSettings } from "@/_services/auth/auth.helpers";

const COOKIE_REFRESH = "session";
const COOKIE_ACCESS = "access";
const refreshExpiresAt = 60 * 60 * 24 * 14;
const accessExpiresAt = 60 * 60 * 24;
const SESSION_REFRESH_TIMEOUT_MS = 8_000;

async function refresh(session: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SESSION_REFRESH_TIMEOUT_MS
  );

  try {
    const responseRefresh = await fetch(
      `${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: session,
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    if (!responseRefresh.ok) {
      return undefined;
    }

    const data = await responseRefresh.json();
    return data.access as string | undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createSession(token: { refresh: string; access: string }) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_REFRESH, token.refresh, getCookieSettings(refreshExpiresAt));
  cookieStore.set(COOKIE_ACCESS, token.access, getCookieSettings(accessExpiresAt));
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_REFRESH)?.value;

  try {
    if (!session) {
      return undefined;
    }

    const newAccess = await refresh(session);
    if (!newAccess) {
      return undefined;
    }

    cookieStore.set(COOKIE_ACCESS, newAccess, getCookieSettings(accessExpiresAt));
    return newAccess;
  } catch {
    return undefined;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const access = cookieStore.get(COOKIE_ACCESS)?.value;
  const session = cookieStore.get(COOKIE_REFRESH)?.value;

  if (access && session) {
    await fetch(`${API_BASE_URL}/authorized/logout/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
        session,
      },
      cache: "no-store",
    }).catch(() => undefined);
  }

  cookieStore.delete(COOKIE_REFRESH);
  cookieStore.delete(COOKIE_ACCESS);
  cookieStore.delete("sessionid");
}

export async function getUserID() {
  return undefined;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_REFRESH)?.value;
  let access = cookieStore.get(COOKIE_ACCESS)?.value;

  try {
    if (!access && session) {
      access = await refresh(session);
      if (access) {
        cookieStore.set(COOKIE_ACCESS, access, getCookieSettings(accessExpiresAt));
      }
    }
  } catch {
    access = undefined;
  }

  return {
    session,
    access,
  };
}
