'use client';

import Link from 'next/link';
import DeleteApplicationButton from '@/app/dashboard/applications/DeleteApplicationButton';
import SpeakerProposalCard from './SpeakerProposalCard';

interface SpeakerProposal {
  id: string;
  format: string;
  abstract: string;
  status: string;
  createdAt: Date;
}

interface SpeakerProposalsSectionProps {
  proposals: SpeakerProposal[];
  maxItems?: number;
  showViewAllLink?: boolean;
  showNewButton?: boolean;
  title?: string;
  description?: string;
}

export default function SpeakerProposalsSection({
  proposals,
  maxItems,
  showViewAllLink = false,
  showNewButton = false,
  title = 'Speaker Proposals',
  description = 'Propose a talk, workshop, or panel discussion',
}: SpeakerProposalsSectionProps) {
  const displayedProposals = maxItems ? proposals.slice(0, maxItems) : proposals;

  if (proposals.length === 0 && !showNewButton) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg border border-border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy">{title}</h2>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-4">
          {showViewAllLink && (
            <Link href="/dashboard/applications" className="text-sm text-blue hover:underline">
              View All
            </Link>
          )}
          {showNewButton && (
            <Link
              href="/speak"
              className="text-sm bg-navy text-white px-4 py-2 rounded hover:bg-navy-light transition-colors"
            >
              New Proposal
            </Link>
          )}
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-8 bg-light rounded">
          <p className="text-muted mb-4">
            You haven&apos;t submitted any speaker proposals yet.
          </p>
          <Link href="/speak" className="text-blue hover:underline text-sm">
            Submit a proposal &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedProposals.map((proposal) => (
            <SpeakerProposalCard
              key={proposal.id}
              id={proposal.id}
              format={proposal.format}
              abstract={proposal.abstract}
              status={proposal.status}
              createdAt={proposal.createdAt}
              actions={
                proposal.status === 'pending' ? (
                  <>
                    <Link
                      href={`/dashboard/applications/speaker/${proposal.id}`}
                      className="text-sm text-blue hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteApplicationButton
                      id={proposal.id}
                      type="speaker"
                      title={proposal.format}
                      status={proposal.status}
                    />
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
