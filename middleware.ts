import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication.
 * Runs once per request at the edge, before any RSC rendering.
 *
 * This is the recommended pattern for Next.js App Router:
 * - Validate session once in middleware
 * - Pass auth state via headers to RSCs (fast header read vs DB query)
 * - RSCs trust the middleware-validated state
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run auth check for protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/api/auth');

  if (!isProtectedRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get('better_auth.session_token')?.value;

  if (!sessionToken) {
    // No session - redirect to login
    const loginUrl = new URL('/auth/email-otp', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session exists - let the request through
  // The actual session validation still happens in RSCs, but this
  // prevents unnecessary RSC rendering for unauthenticated users
  const response = NextResponse.next();

  // Pass session token hash as header for faster lookups
  // RSCs can use this to cache by session without reading cookies repeatedly
  response.headers.set('x-session-id', hashToken(sessionToken));

  return response;
}

/**
 * Simple hash for cache keying (not for security)
 */
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
