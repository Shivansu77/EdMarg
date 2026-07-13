import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const handleRouteProtection = (request: NextRequest, isClerkSignedIn: boolean) => {
  const { pathname } = request.nextUrl;

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
    pathname.startsWith('/api/v1/health');

  const isAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  if (isAsset || isPublicRoute || isClerkSignedIn) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  const redirectPath = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('redirect', redirectPath);
  return NextResponse.redirect(loginUrl);
};

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  return handleRouteProtection(request, Boolean(userId));
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
