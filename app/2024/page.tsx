import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { Metadata } from 'next';

// ISR: archive page, content is static. Only updates on redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Australian AI Safety Forum 2024',
  description: 'The inaugural Australian AI Safety Forum held 7-8 November 2024 at the Sydney Knowledge Hub. Keynotes, workshops, and panels on AI safety science and governance.',
  openGraph: {
    title: 'Australian AI Safety Forum 2024',
    description: 'The inaugural Australian AI Safety Forum held 7-8 November 2024. Over 100 researchers, policymakers, and industry professionals.',
  },
};

export default function Forum2024() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-navy via-navy-light to-brand-blue text-white overflow-hidden py-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />

          <div className="max-w-[1200px] mx-auto px-8 relative text-center">
            <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] px-4 py-2 rounded text-sm font-semibold mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 bg-cyan rounded-full shadow-[0_0_10px_var(--cyan)]" />
              Inaugural Forum
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-tight mb-6">
              Australian AI Safety Forum 2024
            </h1>
            <p className="text-xl leading-relaxed opacity-90 max-w-[800px] mx-auto mb-8">
              7-8 November 2024 • Sydney Knowledge Hub, The University of Sydney
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="https://youtube.com/playlist?list=PLPu7GaTnxbYxu4rV7tUDJjFB92aM8TjMi&feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-white text-navy rounded-md hover:bg-white/90 transition-colors"
              >
                Watch Recordings
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] bg-transparent text-white border-2 border-[rgba(255,255,255,0.4)] rounded-md hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.8)] transition-colors"
              >
                2026 Forum →
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="mb-12">
              <h2 className="font-serif text-[2rem] font-bold text-navy mb-6">
                About the Forum
              </h2>
              <div className="space-y-4 text-lg text-body max-w-[900px]">
                <p>
                  With the establishment of state-backed AI Safety Institutes in the UK, US, and other countries, and the release of the{' '}
                  <a href="https://internationalaisafetyreport.org/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-teal underline transition-colors">
                    International Scientific Report on the Safety of Advanced AI
                  </a>, the global focus on AI safety has recently intensified.
                </p>
                <p>
                  The inaugural Australian AI Safety Forum was a two-day interdisciplinary event held in Sydney on 7-8 November 2024. The forum brought together over 100 researchers, policymakers, and industry professionals to build foundational knowledge and catalyse an Australian AI safety community.
                </p>
                <p>
                  The forum took the International Scientific Report on the Safety of Advanced AI as its scientific foundation, using its technical findings to frame discussions on policy and governance within the Australian context. The event achieved its goals of building shared understanding across sectors and creating new connections that continue to drive Australian AI safety work.
                </p>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-light rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-2">Date & Location</h3>
                <p className="text-body">
                  7-8 November 2024<br />
                  Sydney Knowledge Hub<br />
                  The University of Sydney
                </p>
              </div>
              <div className="bg-light rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-2">Format</h3>
                <p className="text-body">
                  <strong>Day 1:</strong> Single-track keynotes and panels<br />
                  <strong>Day 2:</strong> Parallel workshop sessions
                </p>
              </div>
              <div className="bg-light rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-2">Attendance</h3>
                <p className="text-body">
                  100+ participants<br />
                  Oversubscribed by 70 applicants
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact & Outcomes */}
        <section className="bg-cream py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-serif text-[2rem] font-bold text-navy mb-6 text-center">
              Impact & Outcomes
            </h2>
            <p className="text-center text-muted mb-12 max-w-[800px] mx-auto">
              The forum successfully achieved its goals of building foundational knowledge and catalysing the Australian AI safety community.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-[800px] mx-auto">
              <div className="bg-white rounded-lg p-8 text-center border border-border">
                <div className="text-[3rem] font-serif font-bold text-brand-blue mb-2">92%</div>
                <div className="text-sm uppercase tracking-wider text-muted mb-2">Increased Connection</div>
                <p className="text-sm text-muted">Increased connection with Australian AI safety community</p>
              </div>
              <div className="bg-white rounded-lg p-8 text-center border border-border">
                <div className="text-[3rem] font-serif font-bold text-brand-blue mb-2">76%</div>
                <div className="text-sm uppercase tracking-wider text-muted mb-2">Increased Understanding</div>
                <p className="text-sm text-muted">Increased understanding of Australia&apos;s role in advancing AI safety</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-navy to-brand-blue rounded-xl p-8 text-white">
              <h3 className="font-serif text-2xl font-bold mb-4">Immediate Impact</h3>
              <p className="text-white/90 mb-6">
                Several initiatives launched within weeks of the forum, demonstrating the event&apos;s catalytic effect on the Australian AI safety community:
              </p>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI safety coworking spaces established in Sydney and Melbourne</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Research project investigating open source infrastructure for AI safety in Australia</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ongoing working group formed to coordinate Australian AI safety community efforts</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Program Schedule */}
        <section className="bg-light py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-serif text-[2rem] font-bold text-navy mb-12 text-center">
              Program Schedule
            </h2>

            {/* Day 1 */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-navy to-brand-blue text-white px-6 py-4 rounded-t-lg">
                <h3 className="font-bold text-xl">Day 1: Keynote Day — Thursday 7 November</h3>
              </div>
              <div className="bg-white rounded-b-lg overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">08:00</div>
                    <div className="text-sm text-body">Registration and complimentary barista coffee</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">09:00 - 09:30</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Welcome & Opening</div>
                      <div className="text-sm text-muted">Helen Wilson (Deputy Secretary, Science and Technology), Rupal Ismin (Sydney Knowledge Hub), Liam Carroll (Gradient Institute / Timaeus)</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">09:30</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">State of AI</div>
                      <div className="text-sm text-muted">Tiberio Caetano, Gradient Institute</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">10:00</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Technical AI Safety Landscape</div>
                      <div className="text-sm text-muted">Daniel Murfet, University of Melbourne</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">10:30</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">AI Governance Overview</div>
                      <div className="text-sm text-muted">Kimberlee Weatherall, University of Sydney</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-light">
                    <div className="text-sm font-semibold text-teal">11:00</div>
                    <div className="text-sm text-body">Morning tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">11:30</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Red-Teaming for Generative AI—Silver Bullet or Theater?</div>
                      <div className="text-sm text-muted">Hoda Heidari, Carnegie Mellon University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">12:15</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Building AI Safety Talent Pipeline</div>
                      <div className="text-sm text-muted">Ryan Kidd, MATS Research</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-light">
                    <div className="text-sm font-semibold text-teal">13:00</div>
                    <div className="text-sm text-body">Lunch</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">14:00</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Frontier AI Governance Challenges</div>
                      <div className="text-sm text-muted">Seth Lazar, Australian National University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">14:45</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">ASI Safety via AIXI Framework</div>
                      <div className="text-sm text-muted">Marcus Hutter, Australian National University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-light">
                    <div className="text-sm font-semibold text-teal">15:30</div>
                    <div className="text-sm text-body">Afternoon tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">16:00</div>
                    <div className="font-semibold text-navy">Panel Discussion</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">17:00</div>
                    <div className="text-sm text-body">Networking and beverages</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div>
              <div className="bg-gradient-to-r from-navy to-brand-blue text-white px-6 py-4 rounded-t-lg">
                <h3 className="font-bold text-xl">Day 2: Forum Day — Friday 8 November</h3>
              </div>
              <div className="bg-white rounded-b-lg overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">08:30</div>
                    <div className="text-sm text-body">Doors open</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">09:00</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Introduction to Day 2</div>
                      <div className="text-sm text-muted">Liam Carroll, Gradient Institute / Timaeus</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">09:05</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Workshop: International Scientific Report on Advanced AI Safety</div>
                      <div className="text-sm text-muted mb-2">Daniel Murfet, University of Melbourne</div>
                      <div className="text-sm text-muted">Explores capabilities, risks, and technical approaches for increasingly capable AI systems</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-light">
                    <div className="text-sm font-semibold text-teal">10:30</div>
                    <div className="text-sm text-body">Morning tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">11:00</div>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-navy mb-1">Workshop Track A: International AI Safety Governance Roles for Australia</div>
                        <div className="text-sm text-muted">Johanna Weaver (Tech Policy Design Institute), Chelle Adamson (DISR)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-navy mb-1">Workshop Track B: Defining &quot;Safe&quot; and &quot;Responsible&quot; AI</div>
                        <div className="text-sm text-muted">Qinghua Lu (CSIRO), Alexander Saeri (MIT FutureTech)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-navy mb-1">Workshop Track C: Generalisation in AI Safety Science</div>
                        <div className="text-sm text-muted">Daniel Murfet (University of Melbourne), Marcus Hutter (ANU)</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">12:00</div>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-navy mb-1">Workshop Track A: Frontier AI Governance Proposals</div>
                        <div className="text-sm text-muted">Atoosa Kasirzadeh (Carnegie Mellon), Seth Lazar (ANU)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-navy mb-1">Workshop Track B: Emerging Technical AI Safety Practice</div>
                        <div className="text-sm text-muted">Soroush Pour (Harmony Intelligence), Ryan Kidd (MATS), Karl Berzins (FAR AI)</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-light">
                    <div className="text-sm font-semibold text-teal">13:00</div>
                    <div className="text-sm text-body">Lunch</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">14:00</div>
                    <div>
                      <div className="font-semibold text-navy mb-1">Workshop: Potential Australian AI Safety Institute</div>
                      <div className="text-sm text-muted mb-2">Nitarshan Rajkumar (University of Cambridge), Greg Sadler (Good Ancestors)</div>
                      <div className="text-sm text-muted">Discusses institute models and international examples from UK, US, and Japan</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-cream transition-colors">
                    <div className="text-sm font-semibold text-teal">15:50</div>
                    <div>
                      <div className="font-semibold text-navy">Concluding Remarks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="https://youtube.com/playlist?list=PLPu7GaTnxbYxu4rV7tUDJjFB92aM8TjMi&feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-brand-blue text-white rounded-md hover:bg-navy transition-colors"
              >
                Watch Session Recordings →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
