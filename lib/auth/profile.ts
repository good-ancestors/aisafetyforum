import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, type AuthUser } from './server';
import type { Profile } from '@prisma/client';

/**
 * Get the profile for the current authenticated user.
 *
 * This function:
 * 1. First tries to find profile by neonAuthUserId (stable identity)
 * 2. Falls back to email lookup if neonAuthUserId not linked yet
 * 3. Auto-links the profile to neonAuthUserId if found by email
 *
 * Cached at request level - multiple calls in the same request only execute once.
 * Returns null if not authenticated or no profile exists.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser() as AuthUser | null;

  if (!user) {
    return null;
  }

  return getOrLinkProfile(user);
});

/**
 * Cached profile lookup by user ID and email.
 * Uses unstable_cache for cross-request caching (60s TTL).
 * This dramatically reduces DB queries during navigation/prefetching.
 */
const getCachedProfileLookup = unstable_cache(
  async (userId: string, email: string): Promise<Profile | null> => {
    const start = performance.now();

    // Run both lookups in parallel
    const [profileById, profileByEmail] = await Promise.all([
      prisma.profile.findUnique({ where: { neonAuthUserId: userId } }),
      prisma.profile.findUnique({ where: { email } }),
    ]);

    const lookupTime = performance.now() - start;
    // This only runs on cache MISS
    console.log(`[PERF] getCachedProfileLookup CACHE MISS: ${lookupTime.toFixed(0)}ms`);

    // Found by neonAuthUserId (most reliable)
    if (profileById) {
      return profileById;
    }

    // Found by email - need to link (can't do in cached function, return for linking)
    if (profileByEmail) {
      return profileByEmail;
    }

    return null;
  },
  ['profile-lookup'],
  { revalidate: 60, tags: ['profiles'] }
);

async function getOrLinkProfile(user: AuthUser): Promise<Profile | null> {
  const normalizedEmail = user.email.toLowerCase();

  const cacheStart = performance.now();
  // Get cached profile lookup result
  const profile = await getCachedProfileLookup(user.id, normalizedEmail);
  const cacheTime = performance.now() - cacheStart;
  console.log(`[PERF] getOrLinkProfile total: ${cacheTime.toFixed(0)}ms`);

  if (!profile) {
    return null;
  }

  // If profile exists but isn't linked to this auth user, link it now
  // This write operation can't be cached, but only happens once per user
  if (!profile.neonAuthUserId) {
    const linkStart = performance.now();
    const result = await prisma.profile.update({
      where: { id: profile.id },
      data: { neonAuthUserId: user.id },
    });
    const linkTime = performance.now() - linkStart;
    if (linkTime > 50) {
      console.log(`[PERF] getOrLinkProfile link: ${linkTime.toFixed(0)}ms`);
    }
    return result;
  }

  return profile;
}

/**
 * Get or create a profile for the current authenticated user.
 * Creates a minimal profile if none exists.
 *
 * Cached at request level - multiple calls in the same request only execute once.
 */
export const getOrCreateCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser() as AuthUser | null;

  if (!user) {
    return null;
  }

  // Try to get existing profile (with linking)
  const existing = await getOrLinkProfile(user);
  if (existing) {
    return existing;
  }

  // Create new profile linked to auth user
  const normalizedEmail = user.email.toLowerCase();
  return prisma.profile.create({
    data: {
      neonAuthUserId: user.id,
      email: normalizedEmail,
      name: user.name || null,
    },
  });
});
