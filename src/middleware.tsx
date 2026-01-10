import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    const authorized = await checkAuthorization();

    if (authorized && (pathname === '/auth')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/auth'],
}

async function checkAuthorization() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    return !!session
}