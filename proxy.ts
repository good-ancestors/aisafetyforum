import { type NextRequest, NextResponse } from 'next/server';

/**
 * Authentication proxy for protected routes.
 *
 * Uses the official neonAuthMiddleware from @neondatabase/auth.
 * This handles session validation and redirects unauthenticated users to login.
 *
 * IMPORTANT - Why we use neonAuthMiddleware (not custom cookie checks):
 * - Cookie names are implementation details that can change between versions
 * - Neon Auth wraps Better Auth, which has different cookie names (__Secure-neon-auth vs better-auth)
 * - Manual cookie checks require knowing internal details not exposed in public API
 * - The middleware handles edge cases (OAuth flows, session refresh, etc.)
 *
 * If performance becomes an issue:
 * - Profile first to confirm this is the bottleneck
 * - File an issue with @neondatabase/auth requesting a lightweight mode
 * - Do NOT try to optimize by manually checking cookies
 *
 * Note: If auth is not configured (no NEON_AUTH_BASE_URL), protected routes
 * redirect to home page.
 */
export default async function proxy(request: NextRequest) {
  // Skip auth check if not configured
  if (!process.env.NEON_AUTH_BASE_URL) {
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Use official Neon Auth middleware for session validation
  const { neonAuthMiddleware } = await import('@neondatabase/auth/next/server');
  const authMiddleware = neonAuthMiddleware({
    loginUrl: '/auth/email-otp',
  });

  return authMiddleware(request);
}

export const config = {
  // Protect dashboard and admin routes - require authentication
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
