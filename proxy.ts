import { type NextRequest, NextResponse } from 'next/server';

/**
 * Better Auth session cookie name.
 * Source: https://www.better-auth.com/docs/integrations/next
 * Default is 'better-auth.session_token' (prefix 'better-auth', name 'session_token')
 */
const SESSION_COOKIE_NAME = 'better-auth.session_token';

/**
 * Lightweight proxy for protected routes.
 *
 * IMPORTANT: This only checks for cookie PRESENCE, not validity.
 * Full session validation happens in layouts via neonAuth().
 *
 * Why this pattern:
 * - neonAuthMiddleware does full DB validation (slow, ~200-500ms)
 * - Checking cookie presence is instant (<1ms)
 * - Invalid/expired sessions are caught by layout validation anyway
 * - This eliminates duplicate validation on every request
 *
 * Security note: An attacker with a fake cookie would pass this check
 * but be rejected by the layout's neonAuth() call. No security loss.
 */
export default async function proxy(request: NextRequest) {
  // Skip auth check if not configured
  if (!process.env.NEON_AUTH_BASE_URL) {
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Fast path: check if session cookie exists (name from Better Auth docs)
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    // No session cookie - redirect to login
    const loginUrl = new URL('/auth/email-otp', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session cookie exists - let request through
  // Layout will do full validation and handle invalid/expired sessions
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
