import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

/**
 * Authentication proxy for protected routes.
 *
 * Uses Better Auth's session validation with cookieCache enabled.
 * With cookieCache, session data is stored in an encrypted cookie,
 * so validation reads from the cookie instead of hitting the database.
 *
 * This eliminates the ~300-500ms HTTP call to an external auth service
 * that was required with Neon Auth on every request.
 *
 * Protected routes:
 * - /dashboard/* - User dashboard
 * - /admin/* - Admin panel
 */
export default async function proxy(request: NextRequest) {
  const start = performance.now();

  // Check session using Better Auth
  // With cookieCache enabled, this reads from cookie (fast) instead of DB
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  console.log(`[PERF] proxy session check: ${(performance.now() - start).toFixed(0)}ms`);

  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedRoute && !session) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/email-otp', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect dashboard and admin routes - require authentication
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
