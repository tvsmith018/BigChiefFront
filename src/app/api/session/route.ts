import { NextResponse } from "next/server";

import { authProxy } from "@/_services/auth/authproxy";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await authProxy();

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