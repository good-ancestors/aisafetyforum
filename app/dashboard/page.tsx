import Link from 'next/link';
import { redirect } from 'next/navigation';
import OrdersSection from '@/components/dashboard/OrdersSection';
import ScholarshipApplicationsSection from '@/components/dashboard/ScholarshipApplicationsSection';
import SpeakerProposalsSection from '@/components/dashboard/SpeakerProposalsSection';
import TicketsSection from '@/components/dashboard/TicketsSection';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
  }

  const email = user.email.toLowerCase();

  // Run both queries in parallel for better performance
  const [profile, purchasedOrders] = await Promise.all([
    // Get profile and all related data for this user
    prisma.profile.findUnique({
      where: { email },
      include: {
        registrations: {
          where: { status: 'paid' },
          include: {
            order: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        speakerProposals: {
          orderBy: { createdAt: 'desc' },
        },
        fundingApplications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    // Get orders where this user is the purchaser (for group tickets)
    prisma.order.findMany({
      where: {
        purchaserEmail: email,
        paymentStatus: 'paid',
      },
      include: {
        registrations: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-8">Your Dashboard</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-serif text-xl font-bold text-[--navy]">Profile</h2>
          <Link href="/dashboard/profile" className="text-sm text-[--blue] hover:underline">
            Edit Profile
          </Link>
        </div>
        {profile ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[--text-muted]">Name</span>
              <p className="font-medium">{profile.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-[--text-muted]">Email</span>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <span className="text-[--text-muted]">Title</span>
              <p className="font-medium">{profile.title || 'Not set'}</p>
            </div>
            <div>
              <span className="text-[--text-muted]">Organisation</span>
              <p className="font-medium">{profile.organisation || 'Not set'}</p>
            </div>
          </div>
        ) : (
          <p className="text-[--text-muted]">
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
