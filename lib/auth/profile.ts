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
 * Get or link a profile for a given auth user.
 * Handles the neonAuthUserId linking on first authentication.
 *
 * Email changes should be done through the app (user profile update or admin),
 * not synced from Neon Auth.
 *
 * Optimized to run both lookups in parallel, then link if needed.
 */
async function getOrLinkProfile(user: AuthUser): Promise<Profile | null> {
  const normalizedEmail = user.email.toLowerCase();

  // Run both lookups in parallel
  const [profileById, profileByEmail] = await Promise.all([
    prisma.profile.findUnique({ where: { neonAuthUserId: user.id } }),
    prisma.profile.findUnique({ where: { email: normalizedEmail } }),
  ]);

  // Found by neonAuthUserId (most reliable)
  if (profileById) {
    return profileById;
  }

  // Found by email - link to neonAuthUserId for future lookups
  // This handles the case where:
  // - Someone bought a ticket for this email before they signed up
  // - Or the profile was created before we added neonAuthUserId
  if (profileByEmail) {
    return prisma.profile.update({
      where: { id: profileByEmail.id },
      data: { neonAuthUserId: user.id },
    });
  }

  // No profile exists at all
  return null;
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
