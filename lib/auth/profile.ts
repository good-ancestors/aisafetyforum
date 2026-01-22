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
 * Returns null if not authenticated or no profile exists.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser() as AuthUser | null;

  if (!user) {
    return null;
  }

  return getOrLinkProfile(user);
}

/**
 * Get or link a profile for a given auth user.
 * Handles the neonAuthUserId linking on first authentication.
 *
 * Email changes should be done through the app (user profile update or admin),
 * not synced from Neon Auth.
 */
export async function getOrLinkProfile(user: AuthUser): Promise<Profile | null> {
  const normalizedEmail = user.email.toLowerCase();

  // First, try to find by neonAuthUserId (most reliable, survives email changes)
  let profile = await prisma.profile.findUnique({
    where: { neonAuthUserId: user.id },
  });

  if (profile) {
    return profile;
  }

  // No profile linked by neonAuthUserId yet, try by email
  // This handles the case where:
  // - Someone bought a ticket for this email before they signed up
  // - Or the profile was created before we added neonAuthUserId
  profile = await prisma.profile.findUnique({
    where: { email: normalizedEmail },
  });

  if (profile) {
    // Found by email - link to neonAuthUserId for future lookups
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: { neonAuthUserId: user.id },
    });
    return profile;
  }

  // No profile exists at all
  return null;
}

/**
 * Get or create a profile for the current authenticated user.
 * Creates a minimal profile if none exists.
 */
export async function getOrCreateCurrentProfile(): Promise<Profile | null> {
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
}
