import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, decodeTokenRole } from '@/lib/auth/constants';
import { shouldShowComingSoonForPath } from '@/lib/storefront/coming-soon';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldShowComingSoonForPath(pathname)) {
    return NextResponse.rewrite(new URL('/coming-soon', request.url));
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (!isProtected) {
    if (token && (pathname === '/login' || pathname === '/register') && !decodeTokenRole(token)) {
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const role = decodeTokenRole(token);

  if (!role) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  if (pathname.startsWith('/admin') && role === 'customer') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard') && (role === 'admin' || role === 'sub_admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
