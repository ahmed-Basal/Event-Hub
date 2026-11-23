import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/createActivity', '/manage', '/change-password'];
const GUEST_ONLY_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get('jwtToken')?.value);

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (GUEST_ONLY_PATHS.some((p) => pathname.startsWith(p)) && hasSessionCookie) {
    return NextResponse.redirect(new URL('/activities', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/createActivity/:path*', '/manage/:path*', '/change-password', '/login', '/register'],
};
