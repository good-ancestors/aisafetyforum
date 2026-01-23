import Link from 'next/link';
import { redirect } from 'next/navigation';
import OrdersSection from '@/components/dashboard/OrdersSection';
import TicketsSection from '@/components/dashboard/TicketsSection';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export default async function TicketsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
  }

  // Get profile with registrations
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
    },
  });

  // Get paid orders where this user is the purchaser (for group tickets)
  const paidOrders = await prisma.order.findMany({
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

  // Get pending invoice orders (awaiting payment)
  const pendingInvoiceOrders = await prisma.order.findMany({
    where: {
      purchaserEmail: user.email.toLowerCase(),
      paymentMethod: 'invoice',
      paymentStatus: 'pending',
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

  const myTickets = profile?.registrations || [];
  const hasContent =
    myTickets.length > 0 || paidOrders.length > 0 || pendingInvoiceOrders.length > 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">Your Tickets</h1>
      <p className="text-[--text-muted] mb-8">View and manage your event tickets and orders.</p>

      {!hasContent ? (
        <div className="bg-white rounded-lg border border-[--border] p-8 text-center">
          <div className="w-16 h-16 bg-[--bg-light] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[--text-muted]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-bold text-[--navy] mb-2">No Tickets Yet</h2>
          <p className="text-[--text-muted] mb-6">
            You haven&apos;t registered for the event yet. Get your ticket now!
          </p>
          <Link
            href="/register"
            className="inline-block bg-[--navy] text-white px-6 py-3 rounded font-medium hover:bg-[--navy-light] transition-colors"
          >
            Register Now
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Invoice Orders Section */}
          <OrdersSection
            orders={pendingInvoiceOrders}
            variant="pending"
            title="Awaiting Payment"
            description="Invoice orders pending payment"
          />

          {/* My Tickets Section */}
          <TicketsSection registrations={myTickets} />

          {/* Paid Orders Section */}
          <OrdersSection orders={paidOrders} />

          {/* CTA */}
          <div className="bg-[--bg-light] rounded-lg p-6 text-center">
            <p className="text-[--text-muted] mb-4">Need to purchase additional tickets?</p>
            <Link
              href="/register"
              className="inline-block bg-[--navy] text-white px-6 py-2 rounded font-medium hover:bg-[--navy-light] transition-colors"
            >
              Register More Attendees
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
