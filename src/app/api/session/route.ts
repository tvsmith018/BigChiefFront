import { NextResponse } from "next/server";

import { authProxy } from "@/_services/auth/authproxy";

export const dynamic = "force-dynamic";
const SESSION_AUTH_TIMEOUT_MS = 5_000;

async function resolveSessionUser() {
  try {
    return await Promise.race([
      authProxy(),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), SESSION_AUTH_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await resolveSessionUser();

  return NextResponse.json(
    {
      authenticated: Boolean(user),
      user: user ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}