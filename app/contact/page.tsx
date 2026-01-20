import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { eventConfig } from '@/lib/config';

export const metadata = {
  title: 'Contact Us - Australian AI Safety Forum 2026',
  description: 'Get in touch with the Australian AI Safety Forum organizing team.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-[#0a1f5c] mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-[#5c6670] max-w-[600px] mx-auto">
              Have questions about the Australian AI Safety Forum {eventConfig.year}? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-8 border border-[#e0e4e8]">
              <h2 className="font-bold text-xl text-[#0a1f5c] mb-6">Get In Touch</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[#0a1f5c] mb-2">Email</h3>
                  <a
                    href={`mailto:${eventConfig.organization.email}`}
                    className="text-[#0047ba] hover:text-[#00d4ff] transition-colors"
                  >
                    {eventConfig.organization.email}
                  </a>
                </div>

                <div>
                  <h3 className="font-bold text-[#0a1f5c] mb-2">Event Dates</h3>
                  <p className="text-[#333333]">{eventConfig.datesLong}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#0a1f5c] mb-2">Venue</h3>
                  <p className="text-[#333333]">{eventConfig.venueLong}</p>
                </div>

                <div>
                  <h3 className="font-bold text-[#0a1f5c] mb-2">Organized By</h3>
                  <p className="text-[#333333]">{eventConfig.organization.name}</p>
                  <p className="text-sm text-[#5c6670] mt-1">ABN: {eventConfig.organization.abn}</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-[#e0e4e8]">
                <h3 className="font-bold text-[#0a1f5c] mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/register" className="text-[#0047ba] hover:text-[#00d4ff] transition-colors">
                      → Register for the Forum
                    </a>
                  </li>
                  <li>
                    <a href="/speak" className="text-[#0047ba] hover:text-[#00d4ff] transition-colors">
                      → Submit a Speaker Proposal
                    </a>
                  </li>
                  <li>
                    <a href="/funding" className="text-[#0047ba] hover:text-[#00d4ff] transition-colors">
                      → Apply for Travel Funding
                    </a>
                  </li>
                  <li>
                    <a href="/sponsor" className="text-[#0047ba] hover:text-[#00d4ff] transition-colors">
                      → Become a Sponsor
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8 border border-[#e0e4e8]">
              <h2 className="font-bold text-xl text-[#0a1f5c] mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
