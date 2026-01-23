import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import TaxReceipt from '@/components/TaxReceipt';
import { eventConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { getRegistrationBySessionId, getRegistrationById } from '@/lib/registration-actions';
import { requireStripe } from '@/lib/stripe';

export default async function RegistrationSuccess({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; registration_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const registrationId = params.registration_id;

  let registration = null;
  if (sessionId) {
    registration = await getRegistrationBySessionId(sessionId);

    // If registration is still pending but we have a session_id, check Stripe status
    // In production, this would be handled by webhooks
    if (registration && registration.status === 'pending') {
      try {
        const stripe = requireStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
          // Update registration to paid
          registration = await prisma.registration.update({
            where: { id: registration.id },
            data: {
              status: 'paid',
              stripePaymentId: session.payment_intent as string,
            },
            include: { coupon: true },
          });
        }
      } catch (error) {
        console.error('Error checking Stripe session:', error);
      }
    }
  } else if (registrationId) {
    registration = await getRegistrationById(registrationId);
  }

  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {registration && registration.status === 'paid' ? (
            <>
            <div className="bg-white rounded-lg p-12 border border-[#e0e4e8] text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-[#00d4ff] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h1 className="font-serif text-3xl font-bold text-[#0a1f5c] mb-4">
                Registration Confirmed!
              </h1>
              <p className="text-lg text-[#333333] mb-8">
                Thank you for registering for the Australian AI Safety Forum {eventConfig.year}
              </p>

              {/* Registration Details */}
              <div className="bg-[#f0f4f8] rounded-lg p-6 mb-8 text-left">
                <h2 className="font-bold text-lg text-[#0a1f5c] mb-4">Registration Details</h2>
                <div className="space-y-3 text-[#333333]">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{registration.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{registration.email}</span>
                  </div>
                  {registration.organisation && (
                    <div className="flex justify-between">
                      <span className="font-medium">Organisation:</span>
                      <span>{registration.organisation}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Ticket Type:</span>
                    <span>{registration.ticketType}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-[#fff3cd] rounded-lg p-6 border-l-4 border-[#ffc107] mb-8 text-left">
                <h3 className="font-bold text-lg text-[#856404] mb-3">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-[#856404]">
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
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Tax Receipt */}
            <TaxReceipt registration={registration} />
            </>
          ) : (
            <div className="bg-white rounded-lg p-12 border border-[#e0e4e8] text-center">
              <h1 className="font-serif text-3xl font-bold text-[#0a1f5c] mb-4">
                Registration Processing
              </h1>
              <p className="text-lg text-[#333333] mb-8">
                We&apos;re confirming your registration. Please check your email for confirmation.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors"
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
