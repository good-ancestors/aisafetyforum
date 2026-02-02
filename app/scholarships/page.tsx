import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScholarshipApplicationForm from '@/components/ScholarshipApplicationForm';
import { getCurrentUser } from '@/lib/auth/server';
import { eventConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

// ISR: regenerate every 24h. Currently all content is static (config-driven),
// so pages only truly update on redeploy. If dynamic content (e.g. DB-driven
// speakers/program) is added later, reduce this or add on-demand revalidation.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Scholarships',
  description: `Apply for a scholarship to attend the Australian AI Safety Forum ${eventConfig.year}. Scholarships cover registration and may include travel and accommodation support.`,
  openGraph: {
    title: `Scholarships - Australian AI Safety Forum ${eventConfig.year}`,
    description: 'Apply for financial support to attend the forum. Scholarships cover registration, travel, and accommodation.',
  },
};

export default async function Scholarship() {
  // Get current user's profile for prefilling
  let initialProfile = undefined;
  const user = await getCurrentUser();
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { email: user.email.toLowerCase() },
      select: {
        email: true,
        name: true,
        gender: true,
        title: true,
        organisation: true,
        bio: true,
        linkedin: true,
        twitter: true,
        bluesky: true,
        website: true,
      },
    });
    if (profile) {
      initialProfile = {
        email: profile.email,
        name: profile.name || '',
        gender: profile.gender || '',
        role: profile.title || '',
        organisation: profile.organisation || '',
        bio: profile.bio || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        bluesky: profile.bluesky || '',
        website: profile.website || '',
      };
    }
  }

  return (
    <>
      <Header />
      <main className="bg-cream py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-navy mb-4">
              Apply for a Scholarship
            </h1>
            <div className="text-lg text-body space-y-2">
              <p><strong>Event:</strong> Australian AI Safety Forum {eventConfig.year}</p>
              <p><strong>Dates:</strong> {eventConfig.dates}, {eventConfig.venue}</p>
              <p><strong>Deadline:</strong> {eventConfig.scholarshipDeadline}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-8 border border-border mb-8">
            <p className="text-lg text-body mb-6">
              We offer scholarships to ensure the forum includes diverse voices and perspectives from across the AI safety community. Scholarships cover registration and may include travel and accommodation support depending on need.
            </p>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="font-bold text-xl text-navy mb-4">What&apos;s Included</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-navy">Free Registration</div>
                    <div className="text-sm text-muted">Complimentary ticket to both days of the forum</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-navy">Travel Support</div>
                    <div className="text-sm text-muted">Financial support for flights or transport costs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-navy">Accommodation Support</div>
                    <div className="text-sm text-muted">Help with hotel or accommodation costs where needed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Already Registered Note */}
            <div className="bg-info-bg rounded-lg p-6 border-l-4 border-cyan mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-navy">
                  <strong>Already registered?</strong> No problem — if your scholarship is approved, we&apos;ll refund your ticket.
                </div>
              </div>
            </div>

          </div>

          {/* Who Should Apply */}
          <div className="bg-white rounded-lg p-8 border border-border mb-8">
            <h2 className="font-bold text-xl text-navy mb-4">Who Should Apply</h2>
            <p className="text-body mb-4">
              We prioritise applicants who would benefit most from attending but face barriers. You might be a good fit if you&apos;re:
            </p>
            <ul className="space-y-3 text-body">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>A student, early-career researcher, or PhD candidate</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Working in civil society, non-profit, or public interest roles</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>An independent researcher or practitioner without institutional support</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>From an underrepresented background in the AI safety field</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Travelling from interstate, regional areas, or overseas</span>
              </li>
            </ul>

            <h2 className="font-bold text-xl text-navy mb-4 mt-8">What We&apos;re Looking For</h2>
            <p className="text-body">
              We want to hear how sponsorship to attend the forum would support your work or your contribution to AI safety. Tell us why a scholarship would make a meaningful difference for you. We value interest, contributions and diverse perspectives over credentials.
            </p>
          </div>

          {/* Form */}
          <ScholarshipApplicationForm initialProfile={initialProfile} />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg text-navy mb-3">Register to attend</h3>
              <p className="text-sm text-muted mb-4">
                Ready to purchase a ticket? Registration is now open.
              </p>
              <Link
                href="/register"
                className="text-brand-blue hover:text-teal font-medium text-sm underline"
              >
                Register for the forum →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <h3 className="font-bold text-lg text-navy mb-3">Have a proposal?</h3>
              <p className="text-sm text-muted mb-4">
                Accepted speakers receive free registration and may receive travel support.
              </p>
              <Link
                href="/speak"
                className="text-brand-blue hover:text-teal font-medium text-sm underline"
              >
                Apply to speak →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
