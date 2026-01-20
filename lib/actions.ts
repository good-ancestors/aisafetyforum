'use server';

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

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
    const proposal = await prisma.speakerProposal.create({
      data: {
        email: data.email,
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
    const application = await prisma.fundingApplication.create({
      data: {
        email: data.email,
        name: data.name,
        location: data.location,
        organisation: data.organisation,
        role: data.role,
        whyAttend: data.whyAttend,
        amount: data.amount,
        day1: data.day1,
        day2: data.day2,
        acceptedTerms: data.acceptedTerms,
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
