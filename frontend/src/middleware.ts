import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware to handle route protection and public access.
 * This runs on the Edge/Server and uses Cookies for authentication verification.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('accessToken')?.value;

  // 1. Define Public Routes (accessible without login)
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/blogs') ||
    pathname.startsWith('/browse-mentors') ||
    pathname.startsWith('/mentor-profile') ||
    pathname.startsWith('/assessment') || // Assuming introductory assessment is public
    pathname.startsWith('/api/v1/health') || // Public health check
    pathname.startsWith('/api/v1/users/login') ||
    pathname.startsWith('/api/v1/users/signup');

  // 2. Define Assets and System Routes (always allowed)
  const isAsset = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/') || // We handle API protection via backend or specific checks
    pathname.includes('.') || // Files like favicon.ico, etc.
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  if (isAsset) {
    return NextResponse.next();
  }

  // 3. Protection Logic
  // If user is hitting a private route without a token, redirect to login
  const isPrivateRoute = !isPublicRoute;

  if (isPrivateRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    const redirectPath = `${pathname}${request.nextUrl.search}`;
    // Store the original path to redirect back after login.
    loginUrl.searchParams.set('redirect', redirectPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
