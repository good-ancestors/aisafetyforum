import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ScholarshipEditForm from './ScholarshipEditForm';

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const { id } = await params;

  // Fetch the application and verify ownership
  const application = await prisma.fundingApplication.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!application) {
    notFound();
  }

  // Verify ownership - check both direct email and profile email
  const userEmail = user.email.toLowerCase();
  const isOwner =
    application.email.toLowerCase() === userEmail ||
    application.profile?.email.toLowerCase() === userEmail;

  if (!isOwner) {
    redirect('/dashboard/applications');
  }

  // Check if editable (only pending applications can be edited)
  const isEditable = application.status === 'pending';

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
        {isEditable ? 'Edit Scholarship Application' : 'View Scholarship Application'}
      </h1>
      <p className="text-[--text-muted] mb-8">
        {isEditable
          ? 'Update your application details below.'
          : 'This application has been reviewed and can no longer be edited.'}
      </p>

      {!isEditable && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <p className="font-medium">Application {application.status}</p>
          <p className="text-sm">
            This application has been {application.status} and cannot be modified.
          </p>
        </div>
      )}

      <ScholarshipEditForm
        application={{
          id: application.id,
          whyAttend: application.whyAttend,
          travelSupport: application.travelSupport || '',
          amount: application.amount,
          backgroundInfo: application.backgroundInfo || [],
        }}
        isEditable={isEditable}
      />
    </main>
  );
}
