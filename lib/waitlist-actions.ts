'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';

export type JoinWaitlistResult = {
  success: boolean;
  alreadyExists?: boolean;
  error?: string;
};

/**
 * Add an email to the registration waitlist
 */
export async function joinWaitlist(email: string): Promise<JoinWaitlistResult> {
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  try {
    // Check if already on waitlist
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: true, alreadyExists: true };
    }

    // Create new waitlist entry
    await prisma.waitlistSignup.create({
      data: {
        email: normalizedEmail,
        status: 'pending',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return { success: false, error: 'Failed to join waitlist. Please try again.' };
  }
}

/**
 * Check if an email is already on the waitlist
 */
export async function checkWaitlistStatus(email: string): Promise<{
  onWaitlist: boolean;
  status?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const signup = await prisma.waitlistSignup.findUnique({
      where: { email: normalizedEmail },
      select: { status: true },
    });

    if (signup) {
      return { onWaitlist: true, status: signup.status };
    }

    return { onWaitlist: false };
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return { onWaitlist: false };
  }
}

/**
 * Get all waitlist signups (admin)
 */
export async function getWaitlistSignups(status?: string) {
  try {
    const signups = await prisma.waitlistSignup.findMany({
      where: status ? { status } : undefined,
      include: {
        code: {
          select: {
            code: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return signups;
  } catch (error) {
    console.error('Error fetching waitlist signups:', error);
    return [];
  }
}

/**
 * Get waitlist stats (admin)
 */
export async function getWaitlistStats() {
  try {
    const [total, pending, notified, registered] = await Promise.all([
      prisma.waitlistSignup.count(),
      prisma.waitlistSignup.count({ where: { status: 'pending' } }),
      prisma.waitlistSignup.count({ where: { status: 'notified' } }),
      prisma.waitlistSignup.count({ where: { status: 'registered' } }),
    ]);

    return { total, pending, notified, registered };
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return { total: 0, pending: 0, notified: 0, registered: 0 };
  }
}

/**
 * Update waitlist signup status (admin)
 */
export async function updateWaitlistStatus(
  id: string,
  status: string,
  codeId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.waitlistSignup.update({
      where: { id },
      data: {
        status,
        codeId: codeId || undefined,
      },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Delete a waitlist signup (admin)
 */
export async function deleteWaitlistSignup(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.waitlistSignup.delete({
      where: { id },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting waitlist signup:', error);
    return { success: false, error: 'Failed to delete signup' };
  }
}
