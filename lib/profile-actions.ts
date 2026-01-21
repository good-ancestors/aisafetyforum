'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

export async function updateProfile(
  email: string,
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase();

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
