import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MultiTicketRegistrationForm from '@/components/MultiTicketRegistrationForm';
import { getCurrentUser } from '@/lib/auth/server';
import { eventConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: `Register for the Australian AI Safety Forum ${eventConfig.year}. ${eventConfig.datesLong} at ${eventConfig.venueLong}. Early bird pricing available.`,
  openGraph: {
    title: `Register for the Australian AI Safety Forum ${eventConfig.year}`,
    description: `Secure your ticket for Australia's premier AI safety conference. ${eventConfig.datesLong} in Sydney.`,
  },
};

export default async function Register() {
  // Get current user's profile for prefilling
  const user = await getCurrentUser();
  let profile = null;

  if (user) {
    profile = await prisma.profile.findUnique({
      where: { email: user.email.toLowerCase() },
      select: {
        email: true,
        name: true,
        title: true,
        organisation: true,
      },
    });
  }

  return (
    <>
      <Header />
      <main className="bg-cream py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-navy mb-4">
              Register for the Australian AI Safety Forum {eventConfig.year}
            </h1>
            <div className="text-lg text-body space-y-2">
              <p><strong>Dates:</strong> {eventConfig.datesLong}</p>
              <p><strong>Location:</strong> {eventConfig.venueLong}</p>
            </div>
          </div>

          {/* Registration Form */}
          <MultiTicketRegistrationForm
            initialProfile={profile ? {
              email: profile.email,
              name: profile.name || '',
              role: profile.title || '',
              organisation: profile.organisation || '',
            } : undefined}
          />

          {/* Cancellation Policy */}
          <div className="bg-light rounded-lg p-6 mt-8">
            <h3 className="font-bold text-navy mb-2">Cancellation Policy</h3>
            <p className="text-sm text-muted">
              Full refund available until the event starts. If you&apos;re accepted as a speaker or awarded a scholarship after purchasing a ticket, we&apos;ll refund your registration.
            </p>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg text-navy mb-3">Have a proposal?</h3>
              <p className="text-sm text-muted mb-4">
                Accepted speakers receive free registration and we&apos;ll refund any ticket you&apos;ve already purchased. Travel support may be available.
              </p>
              <Link
                href="/speak"
                className="text-brand-blue hover:text-teal font-medium text-sm underline"
              >
                Apply to speak →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg text-navy mb-3">Need a scholarship?</h3>
              <p className="text-sm text-muted mb-4">
                We offer scholarships with travel and accommodation support. If approved, we&apos;ll refund any ticket you&apos;ve already purchased.
              </p>
              <Link
                href="/scholarships"
                className="text-brand-blue hover:text-teal font-medium text-sm underline"
              >
                Apply for a scholarship →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
