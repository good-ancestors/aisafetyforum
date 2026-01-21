import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TicketCard from '@/components/dashboard/TicketCard';
import OrderCard from '@/components/dashboard/OrderCard';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get profile and all related data for this user
  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
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
  });

  // Get orders where this user is the purchaser (for group tickets)
  const purchasedOrders = await prisma.order.findMany({
    where: {
      purchaserEmail: user.email.toLowerCase(),
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
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-8">
        Your Dashboard
      </h1>

      {/* Profile Section */}
      <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-serif text-xl font-bold text-[--navy]">
            Profile
          </h2>
          <Link
            href="/dashboard/profile"
            className="text-sm text-[--blue] hover:underline"
          >
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

      {/* Your Tickets Section */}
      <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-serif text-xl font-bold text-[--navy]">
            Your Tickets
          </h2>
          <Link
            href="/dashboard/tickets"
            className="text-sm text-[--blue] hover:underline"
          >
            View All Tickets
          </Link>
        </div>
        {profile?.registrations && profile.registrations.length > 0 ? (
          <div className="space-y-4">
            {profile.registrations.slice(0, 2).map((reg) => (
              <TicketCard
                key={reg.id}
                id={reg.id}
                ticketType={reg.ticketType}
                name={reg.name}
                status={reg.status}
                ticketPrice={reg.ticketPrice}
                amountPaid={reg.amountPaid}
                createdAt={reg.createdAt}
                order={reg.order}
                variant="compact"
              />
            ))}
            {profile.registrations.length > 2 && (
              <p className="text-sm text-[--text-muted]">
                + {profile.registrations.length - 2} more ticket(s)
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[--text-muted] mb-4">
              You don&apos;t have any tickets yet.
            </p>
            <Link
              href="/register"
              className="inline-block bg-[--navy] text-white px-6 py-2 rounded hover:bg-[--navy-light] transition-colors"
            >
              Register Now
            </Link>
          </div>
        )}
      </section>

      {/* Purchased Orders (Group Tickets) */}
      {purchasedOrders.length > 0 && (
        <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-serif text-xl font-bold text-[--navy]">
              Orders You&apos;ve Purchased
            </h2>
            <Link
              href="/dashboard/tickets"
              className="text-sm text-[--blue] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-6">
            {purchasedOrders.slice(0, 2).map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                totalAmount={order.totalAmount}
                paymentStatus={order.paymentStatus}
                paymentMethod={order.paymentMethod}
                createdAt={order.createdAt}
                registrations={order.registrations}
                variant="compact"
              />
            ))}
            {purchasedOrders.length > 2 && (
              <p className="text-sm text-[--text-muted]">
                + {purchasedOrders.length - 2} more order(s)
              </p>
            )}
          </div>
        </section>
      )}

      {/* Speaker Proposals */}
      {profile?.speakerProposals && profile.speakerProposals.length > 0 && (
        <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-serif text-xl font-bold text-[--navy]">
              Speaker Proposals
            </h2>
            <Link
              href="/dashboard/applications"
              className="text-sm text-[--blue] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {profile.speakerProposals.slice(0, 2).map((proposal) => (
              <div
                key={proposal.id}
                className="border-l-4 border-[--blue] bg-[--bg-light] p-4 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{proposal.format}</p>
                    <p className="text-sm text-[--text-muted] line-clamp-2">
                      {proposal.abstract.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {proposal.status === 'pending' && (
                      <Link
                        href={`/dashboard/applications/speaker/${proposal.id}`}
                        className="text-xs text-[--blue] hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scholarship Applications */}
      {profile?.fundingApplications && profile.fundingApplications.length > 0 && (
        <section className="bg-white rounded-lg border border-[--border] p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-serif text-xl font-bold text-[--navy]">
              Scholarship Applications
            </h2>
            <Link
              href="/dashboard/applications"
              className="text-sm text-[--blue] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {profile.fundingApplications.slice(0, 2).map((app) => (
              <div
                key={app.id}
                className="border-l-4 border-[--teal] bg-[--bg-light] p-4 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">${app.amount} AUD requested</p>
                    <p className="text-sm text-[--text-muted] line-clamp-2">
                      {app.whyAttend.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {app.status === 'pending' && (
                      <Link
                        href={`/dashboard/applications/scholarship/${app.id}`}
                        className="text-xs text-[--blue] hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
