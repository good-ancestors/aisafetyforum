import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from './config';

/**
 * Server-side authentication utilities for Better Auth.
 *
 * Uses cookie-based session caching (configured in config.ts) to avoid
 * database lookups on every request. Session data is cached in an
 * encrypted cookie for 5 minutes.
 */

/**
 * Get the current authenticated user session and user.
 *
 * Uses React.cache() to deduplicate calls within a single request.
 * This prevents multiple DB queries when multiple components call getSession().
 *
 * With cookieCache enabled, most requests will read from the cookie
 * instead of hitting the database.
 */
export const getSession = cache(async () => {
  const start = performance.now();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(`[PERF] auth.api.getSession(): ${(performance.now() - start).toFixed(0)}ms`);

  if (!session) {
    return { session: null, user: null };
  }

  return {
    session: session.session,
    user: session.user,
  };
});

/**
 * Get the current user from the session.
 * Returns null if not authenticated.
 * Cached at request level via getSession().
 */
export async function getCurrentUser() {
  const { user } = await getSession();
  return user;
}

/**
 * Auth user type from Better Auth.
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};
