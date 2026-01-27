import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Speakers from '@/components/Speakers';
import VideoCarousel from '@/components/VideoCarousel';
import { eventConfig } from '@/lib/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speakers',
  description: `Speakers at the Australian AI Safety Forum ${eventConfig.year}. Leading researchers, policymakers, and industry experts presenting on AI safety science and governance.`,
  openGraph: {
    title: `Speakers - Australian AI Safety Forum ${eventConfig.year}`,
    description: 'Leading researchers, policymakers, and industry experts on AI safety.',
  },
};

export default function SpeakersPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-navy via-navy-light to-brand-blue text-white overflow-hidden py-16">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />

          <div className="max-w-[1200px] mx-auto px-8 relative text-center">
            <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-tight mb-4">
              Speakers
            </h1>
            <p className="text-xl leading-relaxed opacity-90 max-w-[800px] mx-auto">
              {eventConfig.datesLong} • {eventConfig.venueLong}
            </p>
          </div>
        </section>

        {/* CTA to Apply to Speak */}
        <section className="bg-white py-16 px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-serif text-[2rem] font-bold text-navy mb-4">
              Apply to Speak at the 2026 Forum
            </h2>
            <p className="text-lg text-muted mb-8 max-w-[600px] mx-auto">
              We&apos;re looking for speakers to present keynotes, workshops, lightning talks, and panel discussions on AI safety science and governance. Early-stage work and fresh perspectives are welcome.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/speak"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-cyan text-navy-dark rounded-md hover:bg-cyan-dark transition-colors"
              >
                Submit a Proposal
              </Link>
            </div>
            <p className="text-sm text-muted mt-6">
              Accepted speakers receive free registration. Travel support is available for those who need it.
            </p>
          </div>
        </section>

        {/* Speakers Carousel from 2024 */}
        <Speakers />

        {/* Video Carousel */}
        <VideoCarousel />
      </main>
      <Footer />
    </>
  );
}
