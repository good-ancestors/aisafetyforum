import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { eventConfig } from '@/lib/config';
import MultiTicketRegistrationForm from '@/components/MultiTicketRegistrationForm';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

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
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-[#0a1f5c] mb-4">
              Register for the Australian AI Safety Forum {eventConfig.year}
            </h1>
            <div className="text-lg text-[#333333] space-y-2">
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
          <div className="bg-[#f0f4f8] rounded-lg p-6 mt-8">
            <h3 className="font-bold text-[#0a1f5c] mb-2">Cancellation Policy</h3>
            <p className="text-sm text-[#5c6670]">
              Full refund available until the event starts. If you&apos;re accepted as a speaker or awarded a scholarship after purchasing a ticket, we&apos;ll refund your registration.
            </p>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Have a proposal?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                Accepted speakers receive free registration and we&apos;ll refund any ticket you&apos;ve already purchased. Travel support may be available.
              </p>
              <Link
                href="/speak"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
              >
                Apply to speak →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Need a scholarship?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                We offer scholarships with travel and accommodation support. If approved, we&apos;ll refund any ticket you&apos;ve already purchased.
              </p>
              <Link
                href="/scholarships"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
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
