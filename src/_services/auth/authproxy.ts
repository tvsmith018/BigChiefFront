import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth_end, httpClient } from "@/_network";
import type { User } from "@/_types/auth/user";
import type { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { logError, logWarn } from "@/_utilities/observability/logger";
import {
  extractUser,
  getCookieSettings,
  isApiAuthFailure,
  isAuthErrorUser,
} from "./auth.helpers";

const COOKIE_REFRESH = "session";
const COOKIE_ACCESS = "access";
const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24;
const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
type RefreshSessionResult = {
  access: string | null;
  shouldClearCookies: boolean;
};

function getErrorName(error: unknown): string {
  if (error instanceof Error) return error.name;
  return typeof error;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? "");
}

function isTransientAuthProxyError(error: unknown): boolean {
  const name = getErrorName(error).toLowerCase();
  const message = getErrorMessage(error).toLowerCase();

  return (
    name.includes("abort") ||
    name.includes("typeerror") ||
    name.includes("syntaxerror") ||
    message.includes("aborted") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("json")
  );
}

function clearAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  cookieStore.delete(COOKIE_REFRESH);
  cookieStore.delete(COOKIE_ACCESS);
}

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

  if (isApiAuthFailure(res)) return null;

  const user = extractUser(res);
  if (!user || typeof user !== "object") return null;
  if (isAuthErrorUser(user)) return null;

  return user;
}

/**
 * Refresh tokens; persists new access. If API returns a new refresh (rotation), updates session cookie.
 */
async function refreshSession(
  refreshToken: string,
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<RefreshSessionResult> {
  const res = await httpClient.request<
    JWTToken & { code?: string; detail?: string; messages?: unknown[] }
  >(
    auth_end.refreshToken,
    {
      method: "POST",
      body: { refresh: refreshToken },
    },
    { cache: "no-store" }
  );

  if (!res?.access) {
    const hasInvalidTokenSignal =
      res?.code === "token_not_valid" || Array.isArray(res?.messages);
    return {
      access: null,
      shouldClearCookies: hasInvalidTokenSignal,
    };
  }

  cookieStore.set(
    COOKIE_ACCESS,
    res.access,
    getCookieSettings(ACCESS_MAX_AGE_SECONDS)
  );

  if (res.refresh) {
    cookieStore.set(
      COOKIE_REFRESH,
      res.refresh,
      getCookieSettings(REFRESH_MAX_AGE_SECONDS)
    );
  }

  return {
    access: res.access,
    shouldClearCookies: false,
  };
}

/**
 * - Try existing access with `/authorized/me/` first (avoids refresh throttle: backend limits refresh/hour).
 * - Refresh only when access is missing or `/me` fails.
 * - Clears cookies only when refresh fails or `/me` fails after a successful refresh.
 */
export const authProxy = cache(async function authProxy(): Promise<User | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!access) {
    return null;
  }

  try {
    return await fetchMe(access);
  } catch (error: unknown) {
    if (isTransientAuthProxyError(error)) {
      logWarn("auth_proxy_transient_error", {
        errorName: getErrorName(error),
        errorMessage: getErrorMessage(error),
      });
      return null;
    }

    logError("auth_proxy_unexpected_error", error, {
      errorName: getErrorName(error),
    });
    return null;
  }
});

export const authProxyRoute = cache(async function authProxyRoute(): Promise<User | null> {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(COOKIE_REFRESH)?.value;
  const access = cookieStore.get(COOKIE_ACCESS)?.value;

  if (!refresh) {
    if (access) cookieStore.delete(COOKIE_ACCESS);
    return null;
  }

  try {
    if (access) {
      const user = await fetchMe(access);
      if (user) return user;
    }

    const refreshed = await refreshSession(refresh, cookieStore);
    if (!refreshed.access) {
      if (refreshed.shouldClearCookies) {
        clearAuthCookies(cookieStore);
      }
      logWarn("auth_proxy_refresh_failed", {
        shouldClearCookies: refreshed.shouldClearCookies,
      });
      return null;
    }

    let user = await fetchMe(refreshed.access);
    if (user) return user;

    const retryRefreshed = await refreshSession(
      cookieStore.get(COOKIE_REFRESH)?.value ?? refresh,
      cookieStore
    );
    if (!retryRefreshed.access) {
      if (retryRefreshed.shouldClearCookies) {
        clearAuthCookies(cookieStore);
      }
      logWarn("auth_proxy_retry_refresh_failed", {
        shouldClearCookies: retryRefreshed.shouldClearCookies,
      });
      return null;
    }

    user = await fetchMe(retryRefreshed.access);
    if (user) return user;

    clearAuthCookies(cookieStore);
    logWarn("auth_proxy_user_fetch_failed_after_refresh");
    return null;
  } catch (error: unknown) {
    if (isTransientAuthProxyError(error)) {
      logWarn("auth_proxy_transient_error", {
        errorName: getErrorName(error),
        errorMessage: getErrorMessage(error),
      });
      return null;
    }

    logError("auth_proxy_unexpected_error", error, {
      errorName: getErrorName(error),
    });
    return null;
  }
});

export async function getSessionAccessToken(): Promise<string | null> {
  const user = await authProxy();
  if (!user) return null;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_ACCESS)?.value ?? null;
}

export async function requireAuth(redirectTo: string = "/auth"): Promise<void> {
  const user = await authProxy();
  if (!user) redirect(redirectTo);
}

export async function requireGuest(redirectTo: string = "/"): Promise<void> {
  const user = await authProxy();
  if (user) redirect(redirectTo);
}
