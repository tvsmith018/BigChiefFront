import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authProxy } from '@/_services/auth/authproxy'

export async function proxy(request: NextRequest) {
  
  const data = await authProxy();
  const response = NextResponse.next();

  if (data) {
    response.headers.set("userdata", JSON.stringify(data))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}