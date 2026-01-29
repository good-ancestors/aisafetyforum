import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import TaxReceipt from '@/components/TaxReceipt';
import { eventConfig } from '@/lib/config';
import { completeOrder } from '@/lib/order-completion';
import { getOrderBySessionId, getOrderById } from '@/lib/registration-actions';
import { requireStripe } from '@/lib/stripe';

export default async function RegistrationSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const orderId = params.order_id;

  let order = null;

  if (sessionId) {
    // Look up order by Stripe session ID (card payments)
    order = await getOrderBySessionId(sessionId);

    // If order is still pending, check Stripe status and complete if paid
    // This handles the race condition where user lands here before webhook fires
    if (order && order.paymentStatus === 'pending') {
      try {
        const stripe = requireStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
          // Use completeOrder to mark as paid AND send confirmation emails
          await completeOrder(order.id, {
            paymentIntentId: session.payment_intent as string,
          });

          // Refetch the order with updated status
          order = await getOrderBySessionId(sessionId);
        }
      } catch (error) {
        console.error('Error checking Stripe session:', error);
      }
    }
  } else if (orderId) {
    // Direct order lookup (for free tickets redirected with order_id)
    order = await getOrderById(orderId);
  }

  // Get the first registration for display (single ticket) or use order for multi-ticket
  const registration = order?.registrations?.[0] ?? null;
  const isPaid = order?.paymentStatus === 'paid';

  return (
    <>
      <Header />
      <main className="bg-cream py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {order && registration && isPaid ? (
            <>
            <div className="bg-white rounded-lg p-12 border border-border text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h1 className="font-serif text-3xl font-bold text-navy mb-4">
                Registration Confirmed!
              </h1>
              <p className="text-lg text-body mb-8">
                Thank you for registering for the Australian AI Safety Forum {eventConfig.year}
              </p>

              {/* Registration Details */}
              <div className="bg-light rounded-lg p-6 mb-8 text-left">
                <h2 className="font-bold text-lg text-navy mb-4">
                  {order.registrations.length > 1 ? 'Registered Attendees' : 'Registration Details'}
                </h2>
                {order.registrations.length > 1 ? (
                  <div className="space-y-4">
                    {order.registrations.map((reg, index) => (
                      <div key={reg.id} className={`${index > 0 ? 'pt-4 border-t border-border' : ''}`}>
                        <div className="space-y-2 text-body">
                          <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{reg.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{reg.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Ticket:</span>
                            <span>{reg.ticketType}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 text-body">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{registration.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{registration.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ticket Type:</span>
                      <span>{registration.ticketType}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="bg-amber-100 rounded-lg p-6 border-l-4 border-amber-400 mb-8 text-left">
                <h3 className="font-bold text-lg text-amber-800 mb-3">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>You&apos;ll receive a confirmation email shortly with your ticket and event details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>We&apos;ll send program updates and logistics information closer to the event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Add {eventConfig.datesLong} to your calendar!</span>
                  </li>
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Tax Receipt */}
            <TaxReceipt registration={registration} />
            </>
          ) : (
            <div className="bg-white rounded-lg p-12 border border-border text-center">
              <h1 className="font-serif text-3xl font-bold text-navy mb-4">
                Registration Processing
              </h1>
              <p className="text-lg text-body mb-8">
                We&apos;re confirming your registration. Please check your email for confirmation.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
