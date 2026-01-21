import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScholarshipApplicationForm from '@/components/ScholarshipApplicationForm';
import { eventConfig } from '@/lib/config';

export default function Scholarship() {
  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-[#0a1f5c] mb-4">
              Apply for a Scholarship
            </h1>
            <div className="text-lg text-[#333333] space-y-2">
              <p><strong>Event:</strong> Australian AI Safety Forum {eventConfig.year}</p>
              <p><strong>Dates:</strong> {eventConfig.dates}, {eventConfig.venue}</p>
              <p><strong>Deadline:</strong> {eventConfig.scholarshipDeadline}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-8 border border-[#e0e4e8] mb-8">
            <p className="text-lg text-[#333333] mb-6">
              We offer scholarships to ensure the forum includes diverse voices and perspectives from across the AI safety community. Scholarships cover registration and may include travel and accommodation support depending on need.
            </p>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="font-bold text-xl text-[#0a1f5c] mb-4">What&apos;s Included</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-[#0a1f5c]">Free Registration</div>
                    <div className="text-sm text-[#5c6670]">Complimentary ticket to both days of the forum</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-[#0a1f5c]">Travel Support</div>
                    <div className="text-sm text-[#5c6670]">Financial support for flights or transport costs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-bold text-[#0a1f5c]">Accommodation Support</div>
                    <div className="text-sm text-[#5c6670]">Help with hotel or accommodation costs where needed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Already Registered Note */}
            <div className="bg-[#e8f4f8] rounded-lg p-6 border-l-4 border-[#00d4ff] mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#0047ba] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-[#0a1f5c]">
                  <strong>Already registered?</strong> No problem — if your scholarship is approved, we&apos;ll refund your ticket.
                </div>
              </div>
            </div>

          </div>

          {/* Who Should Apply */}
          <div className="bg-white rounded-lg p-8 border border-[#e0e4e8] mb-8">
            <h2 className="font-bold text-xl text-[#0a1f5c] mb-4">Who Should Apply</h2>
            <p className="text-[#333333] mb-4">
              We prioritise applicants who would benefit most from attending but face barriers. You might be a good fit if you&apos;re:
            </p>
            <ul className="space-y-3 text-[#333333]">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>A student, early-career researcher, or PhD candidate</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Working in civil society, non-profit, or public interest roles</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>An independent researcher or practitioner without institutional support</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>From an underrepresented background in the AI safety field</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Travelling from interstate, regional areas, or overseas</span>
              </li>
            </ul>

            <h2 className="font-bold text-xl text-[#0a1f5c] mb-4 mt-8">What We&apos;re Looking For</h2>
            <p className="text-[#333333]">
              We want to hear how attending the forum would support your work or development in AI safety, and why a scholarship would make a meaningful difference for you. We value genuine interest and diverse perspectives over credentials.
            </p>
          </div>

          {/* Form */}
          <ScholarshipApplicationForm />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Register to attend</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                Ready to purchase a ticket? Registration is now open.
              </p>
              <Link
                href="/register"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
              >
                Register for the forum →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Have a proposal?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                Accepted speakers receive free registration and may receive travel support.
              </p>
              <Link
                href="/speak"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
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
