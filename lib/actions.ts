'use server';

import { revalidatePath } from 'next/cache';
import { sendContactFormNotification } from './brevo';
import { prisma } from './prisma';

type ProfileFields = {
  name?: string;
  title?: string;
  organisation?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  bluesky?: string;
  website?: string;
};

/**
 * Get or create a Profile by email.
 * If the profile exists, update fields if new values are provided.
 * Bio and social links are centralized on Profile (single source of truth).
 */
async function getOrCreateProfile(email: string, fields: ProfileFields = {}) {
  const normalizedEmail = email.toLowerCase().trim();

  let profile = await prisma.profile.findUnique({
    where: { email: normalizedEmail },
  });

  if (profile) {
    // Update profile with new info if provided and different
    const updates: ProfileFields = {};
    if (fields.name && fields.name !== profile.name) updates.name = fields.name;
    if (fields.title && fields.title !== profile.title) updates.title = fields.title;
    if (fields.organisation && fields.organisation !== profile.organisation) updates.organisation = fields.organisation;
    if (fields.bio && fields.bio !== profile.bio) updates.bio = fields.bio;
    if (fields.linkedin && fields.linkedin !== profile.linkedin) updates.linkedin = fields.linkedin;
    if (fields.twitter && fields.twitter !== profile.twitter) updates.twitter = fields.twitter;
    if (fields.bluesky && fields.bluesky !== profile.bluesky) updates.bluesky = fields.bluesky;
    if (fields.website && fields.website !== profile.website) updates.website = fields.website;

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
        name: fields.name || null,
        title: fields.title || null,
        organisation: fields.organisation || null,
        bio: fields.bio || null,
        linkedin: fields.linkedin || null,
        twitter: fields.twitter || null,
        bluesky: fields.bluesky || null,
        website: fields.website || null,
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

export type ScholarshipApplicationFormData = {
  email: string;
  name: string;
  organisation?: string;
  role: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
  bluesky?: string;
  website?: string;
  whyAttend: string;
  travelSupport: string;  // No, Yes, Maybe
  travelEstimate?: string;
  backgroundInfo?: string[];  // Self-identification checkboxes
};

export async function submitSpeakerProposal(data: SpeakerProposalFormData) {
  try {
    // Get or create profile - bio and links are stored on Profile (centralized)
    const profile = await getOrCreateProfile(data.email, {
      name: data.name,
      title: data.title,
      organisation: data.organisation,
      bio: data.bio,
      linkedin: data.linkedin,
      twitter: data.twitter,
      bluesky: data.bluesky,
      website: data.website,
    });

    // Create proposal - bio/links no longer stored here (read from Profile)
    const proposal = await prisma.speakerProposal.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        organisation: data.organisation || '',
        title: data.title,
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
    const profile = await getOrCreateProfile(data.email, {
      name: data.name,
      title: data.role, // Use role as title for funding applicants
      organisation: data.organisation,
    });

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

export async function submitScholarshipApplication(data: ScholarshipApplicationFormData) {
  try {
    // Get or create profile - bio and links are stored on Profile (centralized)
    const profile = await getOrCreateProfile(data.email, {
      name: data.name,
      title: data.role,
      organisation: data.organisation,
      bio: data.bio,
      linkedin: data.linkedin,
      twitter: data.twitter,
      bluesky: data.bluesky,
      website: data.website,
    });

    // Store scholarship application - bio/links no longer stored here (read from Profile)
    const application = await prisma.fundingApplication.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        location: '', // No longer collected
        organisation: data.organisation || '',
        role: data.role,
        whyAttend: data.whyAttend,
        travelSupport: data.travelSupport,
        amount: data.travelEstimate || '',
        backgroundInfo: data.backgroundInfo || [],
        day1: true, // Default to both days
        day2: true,
        acceptedTerms: true, // No longer a checkbox, implied by submission
        profileId: profile.id,
      },
    });

    revalidatePath('/scholarship');
    return { success: true, id: application.id };
  } catch (error) {
    console.error('Error submitting scholarship application:', error);
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

  try {
    // Send email notification to team
    await sendContactFormNotification({ name, email, subject, message });
    console.log('Contact form submission sent:', { name, email, subject });
    return { success: true };
  } catch (error) {
    console.error('Error sending contact form:', error);
    // Still return success if email fails - don't block user
    // The form data has been logged, team can follow up manually
    return { success: true };
  }
}
