'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/lib/auth/profile';
import { getAuthServer, getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/lib/security';

export interface ProfileUpdateData {
  name: string;
  title: string;
  organisation: string;
  bio: string;
  linkedin: string;
  twitter: string;
  bluesky: string;
  website: string;
}

/**
 * Change the email address for a user.
 * Updates the Profile, neon_auth.user, and all related records.
 *
 * This keeps the user identity (neonAuthUserId) the same while changing
 * their email everywhere it's stored.
 */
export async function changeEmail(
  newEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { success: false, error: 'Not authenticated or no profile found' };
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim();
    const oldEmail = profile.email.toLowerCase();

    // Validate email format
    if (!isValidEmail(normalizedNewEmail)) {
      return { success: false, error: 'Invalid email address' };
    }

    // No change needed
    if (normalizedNewEmail === oldEmail) {
      return { success: true };
    }

    // Check if new email is already taken by another profile
    const existingProfile = await prisma.profile.findUnique({
      where: { email: normalizedNewEmail },
    });

    if (existingProfile && existingProfile.id !== profile.id) {
      return { success: false, error: 'This email is already in use by another account' };
    }

    // Update everything in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Profile email
      await tx.profile.update({
        where: { id: profile.id },
        data: { email: normalizedNewEmail },
      });

      // 2. Update neon_auth.user email (raw query since it's in a different schema)
      if (profile.neonAuthUserId) {
        await tx.$executeRaw`
          UPDATE neon_auth."user"
          SET email = ${normalizedNewEmail}, "updatedAt" = NOW()
          WHERE id = ${profile.neonAuthUserId}::uuid
        `;
      }

      // 3. Update email on registrations linked to this profile
      await tx.registration.updateMany({
        where: { profileId: profile.id },
        data: { email: normalizedNewEmail },
      });

      // 4. Update email on speaker proposals linked to this profile
      await tx.speakerProposal.updateMany({
        where: { profileId: profile.id },
        data: { email: normalizedNewEmail },
      });

      // 5. Update email on funding applications linked to this profile
      await tx.fundingApplication.updateMany({
        where: { profileId: profile.id },
        data: { email: normalizedNewEmail },
      });

      // 6. Update purchaserEmail on orders (where they were the purchaser)
      await tx.order.updateMany({
        where: { purchaserEmail: oldEmail },
        data: { purchaserEmail: normalizedNewEmail },
      });

      // 7. Update FreeTicketEmail if they had a free ticket entry
      const freeTicket = await tx.freeTicketEmail.findUnique({
        where: { email: oldEmail },
      });
      if (freeTicket) {
        // Check if new email already has a free ticket entry
        const existingFreeTicket = await tx.freeTicketEmail.findUnique({
          where: { email: normalizedNewEmail },
        });
        if (!existingFreeTicket) {
          await tx.freeTicketEmail.update({
            where: { email: oldEmail },
            data: { email: normalizedNewEmail },
          });
        }
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    revalidatePath('/admin/profiles');

    return { success: true };
  } catch (error) {
    console.error('Error changing email:', error);
    return {
      success: false,
      error: 'Failed to change email. Please try again.',
    };
  }
}

export async function updateProfile(
  email: string,
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the authenticated user owns this profile
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedEmail = email.toLowerCase();

    // Prevent users from updating other users' profiles
    if (user.email.toLowerCase() !== normalizedEmail) {
      return { success: false, error: 'Unauthorized: Cannot update another user\'s profile' };
    }

    await prisma.profile.upsert({
      where: { email: normalizedEmail },
      update: {
        name: data.name || null,
        title: data.title || null,
        organisation: data.organisation || null,
        bio: data.bio || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        bluesky: data.bluesky || null,
        website: data.website || null,
      },
      create: {
        email: normalizedEmail,
        name: data.name || null,
        title: data.title || null,
        organisation: data.organisation || null,
        bio: data.bio || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        bluesky: data.bluesky || null,
        website: data.website || null,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.',
    };
  }
}

/**
 * Check if a profile can be deleted.
 * Returns info about what will happen during deletion.
 */
export async function getProfileDeletionInfo(): Promise<{
  canDelete: boolean;
  hasPendingOrders: boolean;
  paidOrderCount: number;
  pendingApplicationCount: number;
  decidedApplicationCount: number;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        canDelete: false,
        hasPendingOrders: false,
        paidOrderCount: 0,
        pendingApplicationCount: 0,
        decidedApplicationCount: 0,
        error: 'Not authenticated',
      };
    }

    const userEmail = user.email.toLowerCase();

    // Check for pending orders (payment in progress)
    const pendingOrders = await prisma.order.count({
      where: {
        purchaserEmail: userEmail,
        paymentStatus: 'pending',
      },
    });

    // Count paid orders (will be orphaned)
    const paidOrders = await prisma.order.count({
      where: {
        purchaserEmail: userEmail,
        paymentStatus: 'paid',
      },
    });

    // Get profile with applications
    const profile = await prisma.profile.findUnique({
      where: { email: userEmail },
      include: {
        speakerProposals: true,
        fundingApplications: true,
      },
    });

    const pendingApplications =
      (profile?.speakerProposals.filter((p) => p.status === 'pending').length || 0) +
      (profile?.fundingApplications.filter((a) => a.status === 'pending').length || 0);

    const decidedApplications =
      (profile?.speakerProposals.filter((p) => p.status !== 'pending').length || 0) +
      (profile?.fundingApplications.filter((a) => a.status !== 'pending').length || 0);

    return {
      canDelete: pendingOrders === 0,
      hasPendingOrders: pendingOrders > 0,
      paidOrderCount: paidOrders,
      pendingApplicationCount: pendingApplications,
      decidedApplicationCount: decidedApplications,
    };
  } catch (error) {
    console.error('Error getting profile deletion info:', error);
    return {
      canDelete: false,
      hasPendingOrders: false,
      paidOrderCount: 0,
      pendingApplicationCount: 0,
      decidedApplicationCount: 0,
      error: 'Failed to check profile status.',
    };
  }
}

/**
 * Delete the current user's profile.
 * - Blocks if there are pending orders (require cancel first)
 * - Orphans paid orders (keeps order data, removes profile link)
 * - Orphans registrations (keeps registration data)
 * - Deletes all applications (both pending and decided)
 * - Deletes the Profile record
 *
 * The caller is responsible for signing out the user after this succeeds.
 */
export async function deleteProfile(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const userEmail = user.email.toLowerCase();

    // Check for pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        purchaserEmail: userEmail,
        paymentStatus: 'pending',
      },
    });

    if (pendingOrders > 0) {
      return {
        success: false,
        error: 'You have pending orders. Please cancel them before deleting your account.',
      };
    }

    // Get the profile
    const profile = await prisma.profile.findUnique({
      where: { email: userEmail },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Perform deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Orphan registrations (set profileId to null)
      await tx.registration.updateMany({
        where: { profileId: profile.id },
        data: { profileId: null },
      });

      // 2. Delete all speaker proposals (including decided ones per plan)
      await tx.speakerProposal.deleteMany({
        where: { profileId: profile.id },
      });

      // 3. Delete all funding applications (including decided ones per plan)
      await tx.fundingApplication.deleteMany({
        where: { profileId: profile.id },
      });

      // 4. Delete the profile
      await tx.profile.delete({
        where: { id: profile.id },
      });
    });

    // 5. Delete the neon_auth user (also removes sessions and linked accounts)
    const authServer = await getAuthServer();
    if (authServer && user.id) {
      await authServer.admin.removeUser({ userId: user.id });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return {
      success: false,
      error: 'Failed to delete account. Please try again.',
    };
  }
}
