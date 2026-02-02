import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { cookies } from 'next/headers';

/**
 * Better Auth session cookie name.
 * Source: https://www.better-auth.com/docs/integrations/next
 * Default is 'better-auth.session_token' (prefix 'better-auth', name 'session_token')
 */
const SESSION_COOKIE_NAME = 'better-auth.session_token';

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
 * Cached session validation.
 *
 * Uses unstable_cache with 30s TTL to avoid DB query on every request.
 * The session token is passed as argument so different sessions get different cache entries.
 *
 * Security tradeoff (acceptable for most apps):
 * - If session is revoked, user may access for up to 30s
 * - For critical operations (password change, etc.), add explicit fresh validation
 *
 * Performance gain:
 * - First request: ~200-500ms (DB query)
 * - Subsequent requests (30s): ~5ms (cached)
 */
const validateSession = unstable_cache(
  async (_sessionToken: string) => {
    const { neonAuth } = await import('@neondatabase/auth/next/server');
    return neonAuth();
  },
  ['session-validation'],
  { revalidate: 30, tags: ['session'] }
);

/**
 * Get the current authenticated user session and user.
 *
 * Uses two layers of caching:
 * 1. unstable_cache (30s) - caches across requests for same session token
 * 2. React.cache() - deduplicates within a single request
 *
 * This dramatically improves navigation performance while maintaining security.
 */
export const getSession = cache(async () => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return { session: null, user: null };
  }

  try {
    // Read session cookie (name from Better Auth docs)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return { session: null, user: null };
    }

    const start = performance.now();
    const result = await validateSession(sessionToken);
    const authTime = performance.now() - start;

    // Log slow validations (likely cache misses)
    if (authTime > 100) {
      console.log(`[PERF] getSession: ${authTime.toFixed(0)}ms (likely cache miss)`);
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
