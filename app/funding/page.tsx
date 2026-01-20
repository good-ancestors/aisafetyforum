import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FundingApplicationForm from '@/components/FundingApplicationForm';
import { eventConfig } from '@/lib/config';

export default function Funding() {
  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-[#0a1f5c] mb-4">
              Apply for Funding Support
            </h1>
            <div className="text-lg text-[#333333] space-y-2">
              <p><strong>Event:</strong> Australian AI Safety Forum {eventConfig.year}</p>
              <p><strong>Dates:</strong> {eventConfig.dates}, {eventConfig.venue}</p>
              <p><strong>Deadline:</strong> {eventConfig.fundingDeadline}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-8 border border-[#e0e4e8] mb-8">
            <p className="text-lg text-[#333333] mb-6">
              We have limited funding for travel and accommodation to help people attend who otherwise couldn't.
            </p>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="font-bold text-xl text-[#0a1f5c] mb-4">What's Included</h2>
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
                    <div className="font-bold text-[#0a1f5c]">Travel Stipend or Reimbursement</div>
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

            {/* Important Note */}
            <div className="bg-[#fff3cd] rounded-lg p-6 border-l-4 border-[#ffc107]">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#856404] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-[#856404]">
                  <strong>Important:</strong> We'll notify you by soon. Please wait to book travel until you hear from us.
                </div>
              </div>
            </div>
          </div>

          {/* Who Should Apply */}
          <div className="bg-white rounded-lg p-8 border border-[#e0e4e8] mb-8">
            <h2 className="font-bold text-xl text-[#0a1f5c] mb-4">Who Should Apply</h2>
            <p className="text-[#333333] mb-4">
              Funding is prioritised for attendees who would benefit most from the forum but face financial barriers, including:
            </p>
            <ul className="space-y-3 text-[#333333]">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Early-career researchers and PhD students working on AI safety</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Independent researchers and practitioners</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Those from underrepresented backgrounds in AI safety</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00d4ff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Interstate or regional attendees with limited institutional support</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <FundingApplicationForm />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Submit a speaker proposal →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
