import { cache } from 'react';

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
 *
 * Uses React.cache() for request-level deduplication - multiple calls in the
 * same request only execute once. This is the recommended pattern for Next.js
 * App Router rather than cross-request caching (which risks stale auth state).
 *
 * Session validation queries the database, which is intentional for security:
 * - Sessions can be revoked immediately
 * - No stale auth state from caching
 *
 * Performance is handled at other layers:
 * - Middleware filters unauthenticated requests early
 * - Profile lookups are cached (safe - profiles don't change auth state)
 * - Data queries are cached with unstable_cache
 */
export const getSession = cache(async () => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return { session: null, user: null };
  }
  try {
    const start = performance.now();
    const { neonAuth } = await import('@neondatabase/auth/next/server');
    const result = await neonAuth();
    const authTime = performance.now() - start;

    if (authTime > 100) {
      console.log(`[PERF] getSession: ${authTime.toFixed(0)}ms`);
    }
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
