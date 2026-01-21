import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TicketCard from '@/components/dashboard/TicketCard';
import OrderCard from '@/components/dashboard/OrderCard';
import ReceiptButton from './ReceiptButton';
import InvoiceButton from './InvoiceButton';
import CancelOrderButton from './CancelOrderButton';
import CancelTicketButton from './CancelTicketButton';

export default async function TicketsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
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
  const hasContent = myTickets.length > 0 || paidOrders.length > 0 || pendingInvoiceOrders.length > 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Your Tickets
      </h1>
      <p className="text-[--text-muted] mb-8">
        View and manage your event tickets and orders.
      </p>

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
          <h2 className="font-serif text-xl font-bold text-[--navy] mb-2">
            No Tickets Yet
          </h2>
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
          {pendingInvoiceOrders.length > 0 && (
            <section className="bg-white rounded-lg border border-amber-300 p-6">
              <h2 className="font-serif text-xl font-bold text-[--navy] mb-4">
                Awaiting Payment
              </h2>
              <p className="text-sm text-[--text-muted] mb-6">
                Invoice orders pending payment
              </p>
              <div className="space-y-6">
                {pendingInvoiceOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    totalAmount={order.totalAmount}
                    paymentStatus={order.paymentStatus}
                    paymentMethod={order.paymentMethod}
                    createdAt={order.createdAt}
                    registrations={order.registrations}
                    invoiceNumber={order.invoiceNumber}
                    invoiceDueDate={order.invoiceDueDate}
                    orgName={order.orgName}
                    orgABN={order.orgABN}
                    variant="full"
                    actions={
                      <>
                        <InvoiceButton orderId={order.id} invoiceNumber={order.invoiceNumber} />
                        <CancelOrderButton
                          orderId={order.id}
                          ticketCount={order.registrations.length}
                          totalAmount={order.totalAmount}
                          paymentMethod={order.paymentMethod}
                          paymentStatus={order.paymentStatus}
                        />
                      </>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* My Tickets Section */}
          {myTickets.length > 0 && (
            <section className="bg-white rounded-lg border border-[--border] p-6">
              <h2 className="font-serif text-xl font-bold text-[--navy] mb-4">
                My Tickets
              </h2>
              <p className="text-sm text-[--text-muted] mb-6">
                Tickets registered to your email address
              </p>
              <div className="space-y-4">
                {myTickets.map((reg) => (
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
                    variant="full"
                    actions={
                      <CancelTicketButton
                        registrationId={reg.id}
                        ticketType={reg.ticketType}
                        attendeeName={reg.name}
                        ticketPrice={reg.ticketPrice || reg.amountPaid}
                        status={reg.status}
                      />
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Paid Orders Section */}
          {paidOrders.length > 0 && (
            <section className="bg-white rounded-lg border border-[--border] p-6">
              <h2 className="font-serif text-xl font-bold text-[--navy] mb-4">
                Orders You&apos;ve Purchased
              </h2>
              <p className="text-sm text-[--text-muted] mb-6">
                Group tickets and orders purchased by you
              </p>
              <div className="space-y-6">
                {paidOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    totalAmount={order.totalAmount}
                    paymentStatus={order.paymentStatus}
                    paymentMethod={order.paymentMethod}
                    createdAt={order.createdAt}
                    registrations={order.registrations}
                    invoiceNumber={order.invoiceNumber}
                    orgName={order.orgName}
                    variant="full"
                    actions={
                      order.paymentMethod === 'invoice' ? (
                        <InvoiceButton orderId={order.id} invoiceNumber={order.invoiceNumber} />
                      ) : (
                        <ReceiptButton orderId={order.id} />
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="bg-[--bg-light] rounded-lg p-6 text-center">
            <p className="text-[--text-muted] mb-4">
              Need to purchase additional tickets?
            </p>
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
