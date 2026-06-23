import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, decodeTokenRole } from '@/lib/auth/constants';

function nextWithPathname(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (!isProtected) {
    if (token && (pathname === '/login' || pathname === '/register') && !decodeTokenRole(token)) {
      const response = nextWithPathname(request);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
    return nextWithPathname(request);
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

  return nextWithPathname(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
