import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './server';

/**
 * Check if the current user is an admin.
 * Returns the profile if admin, null otherwise.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
  });

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
