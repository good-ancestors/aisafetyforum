'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get or create a Profile by email.
 * If the profile exists, optionally update name/title/organisation if provided.
 */
async function getOrCreateProfile(
  email: string,
  name?: string,
  title?: string,
  organisation?: string
) {
  const normalizedEmail = email.toLowerCase().trim();

  let profile = await prisma.profile.findUnique({
    where: { email: normalizedEmail },
  });

  if (profile) {
    // Update profile with new info if provided and different
    const updates: { name?: string; title?: string; organisation?: string } = {};
    if (name && name !== profile.name) updates.name = name;
    if (title && title !== profile.title) updates.title = title;
    if (organisation && organisation !== profile.organisation) updates.organisation = organisation;

    if (Object.keys(updates).length > 0) {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: updates,
      });
    }
  } else {
    // Create new profile
    profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        title: title || null,
        organisation: organisation || null,
      },
    });
  }

  return profile;
}

export type SpeakerProposalFormData = {
  email: string;
  name: string;
  organisation?: string;
  title: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
  bluesky?: string;
  website?: string;
  format: string;
  abstract: string;
  travelSupport: string;
  anythingElse?: string;
  acceptedTerms: boolean;
};

export type FundingApplicationFormData = {
  email: string;
  name: string;
  location: string;
  organisation: string;
  role: string;
  whyAttend: string;
  amount: string;
  day1: boolean;
  day2: boolean;
  acceptedTerms: boolean;
};

export async function submitSpeakerProposal(data: SpeakerProposalFormData) {
  try {
    // Get or create profile for this speaker
    const profile = await getOrCreateProfile(
      data.email,
      data.name,
      data.title,
      data.organisation
    );

    const proposal = await prisma.speakerProposal.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        organisation: data.organisation || '',
        title: data.title,
        bio: data.bio,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        bluesky: data.bluesky || null,
        website: data.website || null,
        format: data.format,
        abstract: data.abstract,
        travelSupport: data.travelSupport,
        anythingElse: data.anythingElse || null,
        acceptedTerms: data.acceptedTerms,
        profileId: profile.id,
      },
    });

    revalidatePath('/speak');
    return { success: true, id: proposal.id };
  } catch (error) {
    console.error('Error submitting speaker proposal:', error);
    return { success: false, error: 'Failed to submit proposal. Please try again.' };
  }
}

export async function submitFundingApplication(data: FundingApplicationFormData) {
  try {
    // Get or create profile for this applicant
    // Note: role is stored on the funding application, not on profile (it's context-specific)
    const profile = await getOrCreateProfile(
      data.email,
      data.name,
      data.role, // Use role as title for funding applicants
      data.organisation
    );

    const application = await prisma.fundingApplication.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        location: data.location,
        organisation: data.organisation,
        role: data.role,
        whyAttend: data.whyAttend,
        amount: data.amount,
        day1: data.day1,
        day2: data.day2,
        acceptedTerms: data.acceptedTerms,
        profileId: profile.id,
      },
    });

    revalidatePath('/funding');
    return { success: true, id: application.id };
  } catch (error) {
    console.error('Error submitting funding application:', error);
    return { success: false, error: 'Failed to submit application. Please try again.' };
  }
}

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) {
    throw new Error('All fields are required');
  }

  // TODO: Send email notification to team
  // For now, just log it
  console.log('Contact form submission:', { name, email, subject, message });

  // You could store in database if needed:
  // await prisma.contactMessage.create({ data: { name, email, subject, message } });

  return { success: true };
}
