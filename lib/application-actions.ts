'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export interface SpeakerProposalUpdateData {
  format: string;
  abstract: string;
  travelSupport: string;
  anythingElse?: string;
}

export interface ScholarshipApplicationUpdateData {
  whyAttend: string;
  travelSupport: string;
  amount: string;
  backgroundInfo: string[];
}

export async function updateSpeakerProposal(
  id: string,
  data: SpeakerProposalUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the proposal and verify ownership
    const proposal = await prisma.speakerProposal.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!proposal) {
      return { success: false, error: 'Proposal not found' };
    }

    // Verify ownership
    const userEmail = user.email.toLowerCase();
    const isOwner =
      proposal.email.toLowerCase() === userEmail ||
      proposal.profile?.email.toLowerCase() === userEmail;

    if (!isOwner) {
      return { success: false, error: 'Not authorized to edit this proposal' };
    }

    // Only allow editing pending proposals
    if (proposal.status !== 'pending') {
      return { success: false, error: 'Only pending proposals can be edited' };
    }

    // Update the proposal
    await prisma.speakerProposal.update({
      where: { id },
      data: {
        format: data.format,
        abstract: data.abstract,
        travelSupport: data.travelSupport,
        anythingElse: data.anythingElse || null,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/applications');
    revalidatePath(`/dashboard/applications/speaker/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating speaker proposal:', error);
    return {
      success: false,
      error: 'Failed to update proposal. Please try again.',
    };
  }
}

export async function updateScholarshipApplication(
  id: string,
  data: ScholarshipApplicationUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the application and verify ownership
    const application = await prisma.fundingApplication.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    // Verify ownership
    const userEmail = user.email.toLowerCase();
    const isOwner =
      application.email.toLowerCase() === userEmail ||
      application.profile?.email.toLowerCase() === userEmail;

    if (!isOwner) {
      return { success: false, error: 'Not authorized to edit this application' };
    }

    // Only allow editing pending applications
    if (application.status !== 'pending') {
      return { success: false, error: 'Only pending applications can be edited' };
    }

    // Update the application
    await prisma.fundingApplication.update({
      where: { id },
      data: {
        whyAttend: data.whyAttend,
        travelSupport: data.travelSupport,
        amount: data.amount,
        backgroundInfo: data.backgroundInfo,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/applications');
    revalidatePath(`/dashboard/applications/scholarship/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating scholarship application:', error);
    return {
      success: false,
      error: 'Failed to update application. Please try again.',
    };
  }
}
