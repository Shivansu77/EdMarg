import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Proxy to handle route protection and public access.
 * This runs on the Edge/Server and uses Cookies for authentication verification.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('accessToken')?.value;

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/blogs') ||
    pathname.startsWith('/browse-mentors') ||
    pathname.startsWith('/mentor-profile') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/api/v1/health') ||
    pathname.startsWith('/api/v1/users/login') ||
    pathname.startsWith('/api/v1/users/signup');

  const isAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  if (isAsset) {
    return NextResponse.next();
  }

  const isPrivateRoute = !isPublicRoute;

  if (isPrivateRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    const redirectPath = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('redirect', redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
