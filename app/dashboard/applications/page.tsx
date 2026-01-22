import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SpeakerProposalsSection from '@/components/dashboard/SpeakerProposalsSection';
import ScholarshipApplicationsSection from '@/components/dashboard/ScholarshipApplicationsSection';

export default async function ApplicationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
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
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">Your Applications</h1>
      <p className="text-[--text-muted] mb-8">
        View and manage your speaker proposals and scholarship applications.
      </p>

      {/* Speaker Proposals Section */}
      <div className="mb-8">
        <SpeakerProposalsSection proposals={speakerProposals} showNewButton />
      </div>

      {/* Scholarship Applications Section */}
      <ScholarshipApplicationsSection applications={scholarshipApplications} showNewButton />
    </main>
  );
}
