import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { cookies } from 'next/headers';

/**
 * Get the auth server instance. Returns null if NEON_AUTH_BASE_URL is not configured.
 */
export async function getAuthServer() {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return null;
  }
  const { createAuthServer } = await import('@neondatabase/auth/next/server');
  return createAuthServer();
}

/**
 * Get the current authenticated user session and user.
 * Uses the neonAuth() utility which reads session from cookies.
 * Returns { session: null, user: null } if auth is not configured or session is invalid.
 *
 * Wrapped in cache() for request-level deduplication - multiple calls in the same
 * request lifecycle will only execute once.
 *
 * Wrapped in try-catch because neonAuth() may attempt to modify cookies
 * (e.g. clearing a stale session after account deletion), which throws
 * in Server Components. Catching this gracefully treats it as unauthenticated.
 */
/**
 * Validate and cache session by token.
 * The session token is passed as argument so different tokens get different cache entries.
 * This dramatically reduces auth DB queries during navigation/prefetching.
 */
const validateSessionByToken = unstable_cache(
  async (_sessionToken: string) => {
    const start = performance.now();
    const { neonAuth } = await import('@neondatabase/auth/next/server');
    const result = await neonAuth();
    const authTime = performance.now() - start;
    console.log(`[PERF] validateSessionByToken CACHE MISS: ${authTime.toFixed(0)}ms`);
    return result;
  },
  ['session-validation'],
  { revalidate: 30, tags: ['session'] }
);

export const getSession = cache(async () => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return { session: null, user: null };
  }
  try {
    const start = performance.now();

    // Get session token from cookies to use as cache key
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better_auth.session_token')?.value || '';

    // No session token = not logged in
    if (!sessionToken) {
      console.log(`[PERF] getSession: no session token`);
      return { session: null, user: null };
    }

    // Validate session with caching based on token
    const result = await validateSessionByToken(sessionToken);
    const totalTime = performance.now() - start;
    console.log(`[PERF] getSession total: ${totalTime.toFixed(0)}ms`);
    return result;
  } catch {
    return { session: null, user: null };
  }
});

/**
 * Get the current user from the session.
 * Returns null if not authenticated or auth is not configured.
 * Cached at request level via getSession().
 */
export async function getCurrentUser() {
  const { user } = await getSession();
  return user;
}

/**
 * Auth user type from Neon Auth (Better Auth).
 * Based on the neon_auth.user table schema.
 */
export type AuthUser = {
  id: string;       // UUID from neon_auth.user
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};
