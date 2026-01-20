import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  // Only run auth middleware if NEON_AUTH_BASE_URL is configured
  if (!process.env.NEON_AUTH_BASE_URL) {
    // If auth is not configured, redirect to home or allow access
    // For now, redirect unauthenticated dashboard access to home
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Dynamically import neonAuthMiddleware to avoid build-time failures
  const { neonAuthMiddleware } = await import('@neondatabase/auth/next/server');
  const authMiddleware = neonAuthMiddleware({
    loginUrl: '/auth/sign-in',
  });

  return authMiddleware(request);
}

export const config = {
  // Protect dashboard routes - require authentication
  matcher: ['/dashboard/:path*'],
};
