import { prisma } from '@/lib/prisma';
import { getCurrentProfile } from './profile';

/**
 * Check if the current user is an admin.
 * Returns the profile if admin, null otherwise.
 */
export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile?.isAdmin) {
    return null;
  }

  return profile;
}

/**
 * Check if an email belongs to an admin user.
 */
export async function isAdmin(email: string): Promise<boolean> {
  const profile = await prisma.profile.findUnique({
    where: { email: email.toLowerCase() },
    select: { isAdmin: true },
  });

  return profile?.isAdmin ?? false;
}
