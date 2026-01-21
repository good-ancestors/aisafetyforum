import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteApplicationButton from './DeleteApplicationButton';

export default async function ApplicationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
    include: {
      speakerProposals: {
        orderBy: { createdAt: 'desc' },
      },
      fundingApplications: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const speakerProposals = profile?.speakerProposals || [];
  const scholarshipApplications = profile?.fundingApplications || [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Your Applications
      </h1>
      <p className="text-[--text-muted] mb-8">
        View and manage your speaker proposals and scholarship applications.
      </p>

      {/* Speaker Proposals Section */}
      <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[--navy]">
              Speaker Proposals
            </h2>
            <p className="text-sm text-[--text-muted] mt-1">
              Propose a talk, workshop, or panel discussion
            </p>
          </div>
          <Link
            href="/speak"
            className="text-sm bg-[--navy] text-white px-4 py-2 rounded hover:bg-[--navy-light] transition-colors"
          >
            New Proposal
          </Link>
        </div>

        {speakerProposals.length > 0 ? (
          <div className="space-y-4">
            {speakerProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border-l-4 border-[--blue] bg-[--bg-light] p-4 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[--navy]">{proposal.format}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          proposal.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : proposal.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-sm text-[--text-muted] line-clamp-2 mb-2">
                      {proposal.abstract}
                    </p>
                    <p className="text-xs text-[--text-muted]">
                      Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {proposal.status === 'pending' && (
                    <div className="flex items-center">
                      <Link
                        href={`/dashboard/applications/speaker/${proposal.id}`}
                        className="text-sm text-[--blue] hover:underline ml-4"
                      >
                        Edit
                      </Link>
                      <DeleteApplicationButton
                        id={proposal.id}
                        type="speaker"
                        title={proposal.format}
                        status={proposal.status}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[--bg-light] rounded">
            <p className="text-[--text-muted] mb-4">
              You haven&apos;t submitted any speaker proposals yet.
            </p>
            <Link
              href="/speak"
              className="text-[--blue] hover:underline text-sm"
            >
              Submit a proposal &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Scholarship Applications Section */}
      <section className="bg-white rounded-lg border border-[--border] p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[--navy]">
              Scholarship Applications
            </h2>
            <p className="text-sm text-[--text-muted] mt-1">
              Apply for travel and accommodation support
            </p>
          </div>
          <Link
            href="/scholarships"
            className="text-sm bg-[--navy] text-white px-4 py-2 rounded hover:bg-[--navy-light] transition-colors"
          >
            New Application
          </Link>
        </div>

        {scholarshipApplications.length > 0 ? (
          <div className="space-y-4">
            {scholarshipApplications.map((app) => (
              <div
                key={app.id}
                className="border-l-4 border-[--teal] bg-[--bg-light] p-4 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[--navy]">
                        ${app.amount} AUD requested
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          app.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-[--text-muted] line-clamp-2 mb-2">
                      {app.whyAttend}
                    </p>
                    <p className="text-xs text-[--text-muted]">
                      Submitted {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex items-center">
                      <Link
                        href={`/dashboard/applications/scholarship/${app.id}`}
                        className="text-sm text-[--blue] hover:underline ml-4"
                      >
                        Edit
                      </Link>
                      <DeleteApplicationButton
                        id={app.id}
                        type="scholarship"
                        title={`$${app.amount} AUD requested`}
                        status={app.status}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[--bg-light] rounded">
            <p className="text-[--text-muted] mb-4">
              You haven&apos;t submitted any scholarship applications yet.
            </p>
            <Link
              href="/scholarships"
              className="text-[--blue] hover:underline text-sm"
            >
              Apply for a scholarship &rarr;
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
