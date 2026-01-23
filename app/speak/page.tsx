import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SpeakerProposalForm from '@/components/SpeakerProposalForm';
import { eventConfig } from '@/lib/config';

export default function Speak() {
  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[800px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-[2.5rem] font-bold text-[#0a1f5c] mb-4">
              Apply to Speak at the Forum
            </h1>
            <div className="text-lg text-[#333333] space-y-2">
              <p><strong>Event:</strong> Australian AI Safety Forum {eventConfig.year}</p>
              <p><strong>Dates:</strong> {eventConfig.dates}, {eventConfig.venue}</p>
              <p><strong>Deadline:</strong> {eventConfig.speakerDeadline}</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg p-6 border border-[#e0e4e8] mb-8">
            <p className="text-[#333333]">
              We&apos;d love to hear your session ideas on AI safety science and governance — whether technical, policy-focused, or cross-disciplinary. Early-stage work and fresh perspectives are welcome. <strong>Accepted speakers receive free registration</strong> and we have travel support available for those who need it.
            </p>
            <p className="text-sm text-[#5c6670] mt-4">
              Already registered? No problem — if your proposal is accepted, we&apos;ll refund your ticket.
            </p>
          </div>

          {/* Form */}
          <SpeakerProposalForm />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Register to attend</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                Not presenting but want to attend? Purchase your ticket now.
              </p>
              <Link
                href="/register"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
              >
                Register for the forum →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Need a scholarship?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                We offer scholarships with travel and accommodation support.
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
