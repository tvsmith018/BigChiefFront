import { NextResponse } from "next/server";

import { authProxyRoute } from "@/_services/auth/authproxy";
import { logInfo, logWarn } from "@/_utilities/observability/logger";
import {
  buildJsonErrorResponse,
  getClientIp,
  getLimitState,
  hasSessionCookies,
} from "../_shared/bff.helpers";

export const dynamic = "force-dynamic";
const SESSION_AUTH_TIMEOUT_MS = 5_000;
const RATE_LIMIT_WINDOW_MS = Number(process.env.BFF_RATE_LIMIT_WINDOW_MS ?? 60_000);
const SESSION_RATE_LIMIT_MAX = Number(process.env.BFF_SESSION_RATE_LIMIT_MAX ?? 90);
const rateLimitState = new Map<string, { count: number; resetAt: number }>();

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
  const limit = getLimitState(
    rateLimitState,
    "session",
    SESSION_RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
    isInternalServerRequest,
    clientIp
  );

  if (!limit.allowed) {
    logWarn("bff_session_rate_limited", { requestId, clientIp });
    return buildJsonErrorResponse(
      "Rate limit exceeded.",
      429,
      requestId,
      "no-store, no-cache, must-revalidate, proxy-revalidate",
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
  }

  const user = await resolveSessionUser();
  const hasAuthCookies = hasSessionCookies(
    request.headers.get("cookie") ?? ""
  );

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