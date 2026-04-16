import { NextRequest, NextResponse } from "next/server";

/**
 * Global request policy:
 * - Keep this proxy intentionally minimal (no auth redirects/rewrites here).
 * - Route-level auth/security stays in server layouts and API handlers.
 * - Attach a request correlation ID when missing for traceability.
 */
export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  if (!requestHeaders.get("x-request-id")) {
    requestHeaders.set("x-request-id", crypto.randomUUID());
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
