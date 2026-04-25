import { NextResponse } from "next/server";

import { authProxyRoute } from "@/_services/auth/authproxy";
import { logInfo, logWarn } from "@/_utilities/observability/logger";

export const dynamic = "force-dynamic";
const SESSION_AUTH_TIMEOUT_MS = 5_000;
const RATE_LIMIT_WINDOW_MS = Number(process.env.BFF_RATE_LIMIT_WINDOW_MS ?? 60_000);
const SESSION_RATE_LIMIT_MAX = Number(process.env.BFF_SESSION_RATE_LIMIT_MAX ?? 90);
const rateLimitState = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim();
  return ip || null;
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitState.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: SESSION_RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  existing.count += 1;
  const remaining = Math.max(SESSION_RATE_LIMIT_MAX - existing.count, 0);
  const allowed = existing.count <= SESSION_RATE_LIMIT_MAX;
  return { allowed, remaining, resetAt: existing.resetAt };
}

async function resolveSessionUser() {
  try {
    return await Promise.race([
      authProxyRoute(),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), SESSION_AUTH_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const clientIp = getClientIp(request);
  const isInternalServerRequest =
    request.headers.get("x-bff-internal-request") === "1";
  const limit = !isInternalServerRequest && clientIp
    ? consumeRateLimit(`session:${clientIp}`)
    : {
        allowed: true,
        remaining: SESSION_RATE_LIMIT_MAX,
        resetAt: Date.now() + RATE_LIMIT_WINDOW_MS,
      };

  if (!limit.allowed) {
    logWarn("bff_session_rate_limited", { requestId, clientIp });
    return NextResponse.json(
      { detail: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "x-request-id": requestId,
          "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const user = await resolveSessionUser();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasAuthCookies =
    cookieHeader.includes("access=") || cookieHeader.includes("session=");

  const response = NextResponse.json(
    {
      authenticated: Boolean(user) || hasAuthCookies,
      user: user ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "x-request-id": requestId,
      },
    }
  );
  logInfo("bff_session_completed", {
    requestId,
    clientIp,
    authenticated: Boolean(user) || hasAuthCookies,
    latency_ms: Date.now() - startedAt,
    rateRemaining: limit.remaining,
    isInternalServerRequest,
    hasAuthCookies,
  });
  return response;
}