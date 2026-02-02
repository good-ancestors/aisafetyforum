import Link from 'next/link';
import { redirect } from 'next/navigation';
import OrdersSection from '@/components/dashboard/OrdersSection';
import ProfileAvatar from '@/components/ProfileAvatar';
import ScholarshipApplicationsSection from '@/components/dashboard/ScholarshipApplicationsSection';
import SpeakerProposalsSection from '@/components/dashboard/SpeakerProposalsSection';
import TicketsSection from '@/components/dashboard/TicketsSection';
import { getCurrentUser } from '@/lib/auth/server';
import { getUserDashboardData } from '@/lib/cached-queries';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
  }

  // Single cached call gets all dashboard data
  const { profile, purchasedOrders } = await getUserDashboardData(user.email);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-8">Your Dashboard</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-lg border border-border p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-serif text-xl font-bold text-navy">Profile</h2>
          <Link href="/dashboard/profile" className="text-sm text-blue hover:underline">
            Edit Profile
          </Link>
        </div>
        {profile ? (
          <div className="flex gap-6">
            <ProfileAvatar
              email={profile.email}
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="lg"
            />
            <div className="grid grid-cols-2 gap-4 text-sm flex-1">
              <div>
                <span className="text-muted">Name</span>
                <p className="font-medium">{profile.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-muted">Email</span>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <span className="text-muted">Title</span>
                <p className="font-medium">{profile.title || 'Not set'}</p>
              </div>
              <div>
                <span className="text-muted">Organisation</span>
                <p className="font-medium">{profile.organisation || 'Not set'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted">
            No profile found. Register for the event to create one.
          </p>
        )}
      </section>

      {/* Tickets Section */}
      <div className="mb-8">
        <TicketsSection
          registrations={profile?.registrations || []}
          maxItems={2}
          showViewAllLink
          title="Your Tickets"
        />
      </div>

      {/* Orders Section */}
      <div className="mb-8">
        <OrdersSection orders={purchasedOrders} maxItems={2} showViewAllLink />
      </div>

      {/* Speaker Proposals Section */}
      {profile?.speakerProposals && profile.speakerProposals.length > 0 && (
        <div className="mb-8">
          <SpeakerProposalsSection
            proposals={profile.speakerProposals}
            maxItems={2}
            showViewAllLink
          />
        </div>
      )}

      {/* Scholarship Applications Section */}
      {profile?.fundingApplications && profile.fundingApplications.length > 0 && (
        <div className="mb-8">
          <ScholarshipApplicationsSection
            applications={profile.fundingApplications}
            maxItems={2}
            showViewAllLink
          />
        </div>
      )}
    </main>
  );
}
