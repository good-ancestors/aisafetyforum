import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { eventConfig } from '@/lib/config';
import RegistrationForm from '@/components/RegistrationForm';

export default function Register() {
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
          <RegistrationForm />

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Have a proposal?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                Accepted speakers receive free registration. Travel support may be available.
              </p>
              <Link
                href="/speak"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
              >
                Submit a speaker proposal →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-6 border border-[#e0e4e8]">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">Need funding support?</h3>
              <p className="text-sm text-[#5c6670] mb-4">
                We have limited funding for travel and accommodation to help people attend who otherwise couldn't.
              </p>
              <Link
                href="/funding"
                className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
              >
                Apply for funding →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
