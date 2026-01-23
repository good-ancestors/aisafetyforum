import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import SpeakerProposalEditForm from './SpeakerProposalEditForm';

export default async function EditSpeakerProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
  }

  const { id } = await params;

  // Fetch the proposal and verify ownership
  const proposal = await prisma.speakerProposal.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!proposal) {
    notFound();
  }

  // Verify ownership - check both direct email and profile email
  const userEmail = user.email.toLowerCase();
  const isOwner =
    proposal.email.toLowerCase() === userEmail ||
    proposal.profile?.email.toLowerCase() === userEmail;

  if (!isOwner) {
    redirect('/dashboard/applications');
  }

  // Check if editable (only pending proposals can be edited)
  const isEditable = proposal.status === 'pending';

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/applications"
          className="text-sm text-[--blue] hover:underline"
        >
          &larr; Back to Applications
        </Link>
      </div>

      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        {isEditable ? 'Edit Speaker Proposal' : 'View Speaker Proposal'}
      </h1>
      <p className="text-[--text-muted] mb-8">
        {isEditable
          ? 'Update your proposal details below.'
          : 'This proposal has been reviewed and can no longer be edited.'}
      </p>

      {!isEditable && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <p className="font-medium">Proposal {proposal.status}</p>
          <p className="text-sm">
            This proposal has been {proposal.status} and cannot be modified.
          </p>
        </div>
      )}

      <SpeakerProposalEditForm
        proposal={{
          id: proposal.id,
          format: proposal.format,
          abstract: proposal.abstract,
          travelSupport: proposal.travelSupport,
          anythingElse: proposal.anythingElse || '',
        }}
        isEditable={isEditable}
      />
    </main>
  );
}
