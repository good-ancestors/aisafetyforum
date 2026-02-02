import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { eventConfig } from '@/lib/config';
import type { Metadata } from 'next';

// ISR: regenerate every 24h. Currently all content is static (config-driven),
// so pages only truly update on redeploy. If dynamic content is added later,
// reduce this or add on-demand revalidation.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Australian AI Safety Forum organizing team.',
  openGraph: {
    title: `Contact Us - Australian AI Safety Forum ${eventConfig.year}`,
    description: 'Get in touch with the Australian AI Safety Forum organizing team.',
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-cream py-16 px-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-navy mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted max-w-[600px] mx-auto">
              Have questions about the Australian AI Safety Forum {eventConfig.year}? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-8 border border-border">
              <h2 className="font-bold text-xl text-navy mb-6">Get In Touch</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-navy mb-2">Event Dates</h3>
                  <p className="text-body">{eventConfig.datesLong}</p>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-2">Venue</h3>
                  <p className="text-body">{eventConfig.venueLong}</p>
                </div>

                <div>
                  <h3 className="font-bold text-navy mb-2">Organized By</h3>
                  <p className="text-body">{eventConfig.organization.name}</p>
                  <p className="text-sm text-muted mt-1">ABN: {eventConfig.organization.abn}</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-bold text-navy mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/register" className="text-brand-blue hover:text-cyan transition-colors">
                      → Register for the Forum
                    </a>
                  </li>
                  <li>
                    <a href="/speak" className="text-brand-blue hover:text-cyan transition-colors">
                      → Submit a Speaker Proposal
                    </a>
                  </li>
                  <li>
                    <a href="/scholarships" className="text-brand-blue hover:text-cyan transition-colors">
                      → Apply for a Scholarship
                    </a>
                  </li>
                  <li>
                    <a href="/sponsorship" className="text-brand-blue hover:text-cyan transition-colors">
                      → Become a Sponsor
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8 border border-border">
              <h2 className="font-bold text-xl text-navy mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
