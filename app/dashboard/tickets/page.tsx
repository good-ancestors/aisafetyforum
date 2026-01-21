import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ReceiptButton from './ReceiptButton';
import InvoiceButton from './InvoiceButton';

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
                  <div
                    key={order.id}
                    className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50/50"
                  >
                    {/* Order Header */}
                    <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[--navy]">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-[--text-muted]">
                            {new Date(order.createdAt).toLocaleDateString()} • Invoice
                            {order.invoiceDueDate && (
                              <> • Due {new Date(order.invoiceDueDate).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-[--navy]">
                              ${(order.totalAmount / 100).toFixed(2)} AUD
                            </p>
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">
                              Awaiting Payment
                            </span>
                          </div>
                          <InvoiceButton orderId={order.id} invoiceNumber={order.invoiceNumber} />
                        </div>
                      </div>
                    </div>

                    {/* Tickets in Order */}
                    <div className="p-4">
                      <p className="text-sm font-medium text-[--text-muted] mb-3">
                        {order.registrations.length} Ticket(s) - will be confirmed upon payment
                      </p>
                      <div className="space-y-2">
                        {order.registrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="flex justify-between items-center text-sm bg-white p-3 rounded border border-amber-100"
                          >
                            <div>
                              <span className="font-medium text-[--navy]">{reg.name}</span>
                              <span className="text-[--text-muted] ml-2">({reg.email})</span>
                            </div>
                            <span className="text-[--text-muted]">{reg.ticketType}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice Details */}
                    {order.invoiceNumber && (
                      <div className="bg-amber-100/50 px-4 py-3 border-t border-amber-200">
                        <p className="text-xs text-[--text-muted]">
                          Invoice: {order.invoiceNumber}
                          {order.orgName && ` • ${order.orgName}`}
                          {order.orgABN && ` • ABN: ${order.orgABN}`}
                        </p>
                      </div>
                    )}
                  </div>
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
                  <div
                    key={reg.id}
                    className="border-l-4 border-[--cyan] bg-[--bg-light] p-4 rounded-r"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[--navy]">
                            {reg.ticketType} Ticket
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-sm text-[--text-muted]">
                          Receipt: AISF-{reg.id.slice(-8).toUpperCase()}
                        </p>
                        {reg.order && (
                          <p className="text-xs text-[--text-muted] mt-1">
                            Order #{reg.order.id.slice(-8).toUpperCase()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[--navy]">
                          ${((reg.ticketPrice || reg.amountPaid) / 100).toFixed(2)} AUD
                        </p>
                        <p className="text-xs text-[--text-muted]">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
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
                  <div
                    key={order.id}
                    className="border border-[--border] rounded-lg overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-[--bg-light] px-4 py-3 border-b border-[--border]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[--navy]">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-[--text-muted]">
                            {new Date(order.createdAt).toLocaleDateString()} •{' '}
                            {order.paymentMethod === 'invoice' ? 'Invoice' : 'Card Payment'}
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-[--navy]">
                              ${(order.totalAmount / 100).toFixed(2)} AUD
                            </p>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                              Paid
                            </span>
                          </div>
                          {order.paymentMethod === 'invoice' ? (
                            <InvoiceButton orderId={order.id} invoiceNumber={order.invoiceNumber} />
                          ) : (
                            <ReceiptButton orderId={order.id} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tickets in Order */}
                    <div className="p-4">
                      <p className="text-sm font-medium text-[--text-muted] mb-3">
                        {order.registrations.length} Ticket(s)
                      </p>
                      <div className="space-y-2">
                        {order.registrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="flex justify-between items-center text-sm bg-[--bg-light] p-3 rounded"
                          >
                            <div>
                              <span className="font-medium text-[--navy]">{reg.name}</span>
                              <span className="text-[--text-muted] ml-2">({reg.email})</span>
                            </div>
                            <span className="text-[--text-muted]">{reg.ticketType}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice Details (if applicable) */}
                    {order.paymentMethod === 'invoice' && order.invoiceNumber && (
                      <div className="bg-[--bg-light] px-4 py-3 border-t border-[--border]">
                        <p className="text-xs text-[--text-muted]">
                          Invoice: {order.invoiceNumber}
                          {order.orgName && ` • ${order.orgName}`}
                        </p>
                      </div>
                    )}
                  </div>
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
