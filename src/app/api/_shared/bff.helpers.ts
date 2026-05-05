import { NextResponse } from "next/server";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp?.trim();
  return ip || null;
}

export function consumeRateLimit(
  state: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = state.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    state.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(max - existing.count, 0);
  const allowed = existing.count <= max;
  return { allowed, remaining, resetAt: existing.resetAt };
}

export function getLimitState(
  state: Map<string, { count: number; resetAt: number }>,
  keyPrefix: string,
  max: number,
  windowMs: number,
  isInternalServerRequest: boolean,
  clientIp: string | null
): RateLimitResult {
  if (isInternalServerRequest || !clientIp) {
    return {
      allowed: true,
      remaining: max,
      resetAt: Date.now() + windowMs,
    };
  }
  return consumeRateLimit(state, `${keyPrefix}:${clientIp}`, max, windowMs);
}

export function buildSecurityHeaders(contentType: string) {
  return {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  };
}

export function buildJsonErrorResponse(
  detail: string,
  status: number,
  requestId: string,
  cacheControl: string,
  retryAfterSeconds?: number
) {
  const headers: Record<string, string> = {
    ...buildSecurityHeaders("application/json"),
    "x-request-id": requestId,
    "cache-control": cacheControl,
  };

  if (retryAfterSeconds !== undefined) {
    headers["retry-after"] = String(retryAfterSeconds);
  }

  return NextResponse.json({ detail }, { status, headers });
}

export function hasAuthContext(request: Request, cookieHeader?: string) {
  const cookieValue = cookieHeader ?? request.headers.get("cookie") ?? "";
  return Boolean(
    request.headers.get("authorization") ||
      cookieValue.includes("access=") ||
      cookieValue.includes("session=")
  );
}

export function hasSessionCookies(cookieHeader: string) {
  return cookieHeader.includes("access=") || cookieHeader.includes("session=");
}
