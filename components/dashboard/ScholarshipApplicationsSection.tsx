'use client';

import Link from 'next/link';
import DeleteApplicationButton from '@/app/dashboard/applications/DeleteApplicationButton';
import ScholarshipApplicationCard from './ScholarshipApplicationCard';

interface ScholarshipApplication {
  id: string;
  amount: number | string | { toString(): string };
  whyAttend: string;
  status: string;
  createdAt: Date;
}

interface ScholarshipApplicationsSectionProps {
  applications: ScholarshipApplication[];
  maxItems?: number;
  showViewAllLink?: boolean;
  showNewButton?: boolean;
  title?: string;
  description?: string;
}

export default function ScholarshipApplicationsSection({
  applications,
  maxItems,
  showViewAllLink = false,
  showNewButton = false,
  title = 'Scholarship Applications',
  description = 'Apply for travel and accommodation support',
}: ScholarshipApplicationsSectionProps) {
  const displayedApplications = maxItems ? applications.slice(0, maxItems) : applications;

  if (applications.length === 0 && !showNewButton) {
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
              href="/scholarships"
              className="text-sm bg-navy text-white px-4 py-2 rounded hover:bg-navy-light transition-colors"
            >
              New Application
            </Link>
          )}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-8 bg-light rounded">
          <p className="text-muted mb-4">
            You haven&apos;t submitted any scholarship applications yet.
          </p>
          <Link href="/scholarships" className="text-blue hover:underline text-sm">
            Apply for a scholarship &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedApplications.map((app) => (
            <ScholarshipApplicationCard
              key={app.id}
              id={app.id}
              amount={app.amount}
              whyAttend={app.whyAttend}
              status={app.status}
              createdAt={app.createdAt}
              actions={
                app.status === 'pending' ? (
                  <>
                    <Link
                      href={`/dashboard/applications/scholarship/${app.id}`}
                      className="text-sm text-blue hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteApplicationButton
                      id={app.id}
                      type="scholarship"
                      title={`${String(app.amount)} requested`}
                      status={app.status}
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
