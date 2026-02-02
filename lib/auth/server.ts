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
export const getSession = cache(async () => {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return { session: null, user: null };
  }
  try {
    const { neonAuth } = await import('@neondatabase/auth/next/server');
    return await neonAuth();
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
