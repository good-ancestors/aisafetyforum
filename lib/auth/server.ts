import { cache } from 'react';

/**
 * Server-side authentication utilities for Neon Auth.
 *
 * IMPORTANT - Use official APIs only:
 * - Always use neonAuth() for session validation, never read cookies directly
 * - Cookie names are internal implementation details (e.g., __Secure-neon-auth.session_token)
 * - These details can change between versions and break your code
 * - The official API handles all edge cases correctly
 *
 * For caching session validation:
 * - Use React.cache() for request-level deduplication (safe, standard pattern)
 * - Do NOT use unstable_cache with custom cookie reading (fragile, hardcodes internals)
 * - If cross-request caching is needed, consult Neon Auth docs for supported patterns
 */

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
 * Uses React.cache() to deduplicate calls within a single request.
 * This prevents multiple DB queries when multiple components call getSession().
 *
 * Note: This calls the official neonAuth() which handles all session validation.
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
