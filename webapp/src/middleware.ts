import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('/api/') ||
        request.nextUrl.pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const userId = request.cookies.get('budgeting_user_id')?.value;
    const publicPaths = ['/login', '/register', '/verify'];
    const isPublicPage = publicPaths.some(p => request.nextUrl.pathname === p);

    if (!userId && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (userId && isPublicPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
