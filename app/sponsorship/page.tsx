import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { eventConfig } from '@/lib/config';
import type { Metadata } from 'next';

// ISR: regenerate every 24h. Currently all content is static (config-driven),
// so pages only truly update on redeploy. If dynamic content (e.g. DB-driven
// speakers/program) is added later, reduce this or add on-demand revalidation.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Sponsorship',
  description: `Become a sponsor of the Australian AI Safety Forum ${eventConfig.year}. Support Australia's premier AI safety conference and connect with leading researchers and policymakers.`,
  openGraph: {
    title: `Sponsorship - Australian AI Safety Forum ${eventConfig.year}`,
    description: "Support Australia's premier AI safety conference. Multiple sponsorship tiers available.",
  },
};

// eslint-disable-next-line max-lines-per-function -- Static page with sponsorship tiers, benefits, and contact info
export default function SponsorPage() {
  const sponsorshipTiers = [
    {
      name: 'Gold',
      amount: '$75,000',
      benefits: [
        'Prominent recognition in opening remarks',
        'Recognition in all communications and materials',
        '10 tickets to the forum',
      ],
      highlight: true,
    },
    {
      name: 'Silver',
      amount: '$50,000',
      benefits: [
        'Recognition in communications and materials',
        '5 tickets to the forum',
      ],
      highlight: false,
    },
    {
      name: 'Bronze',
      amount: '$20,000',
      benefits: [
        'Recognition in materials',
        '2 tickets to the forum',
      ],
      highlight: false,
    },
  ];

  const impactStats = [
    { value: '100+', label: 'Attendees in 2024' },
    { value: '76%', label: "Increased understanding of Australia's role" },
    { value: '92%', label: 'Increased connection with AI safety community' },
    { value: '85%', label: 'Rated experience as good or very good' },
  ];

  const organisingCommittee = [
    {
      name: 'Gradient Institute',
      lead: 'Tiberio Caetano',
      title: 'Chief Scientist',
      website: 'https://www.gradientinstitute.org/',
      logo: '/logos/gradient-institute.svg',
    },
    {
      name: 'Good Ancestors',
      lead: 'Greg Sadler',
      title: 'CEO',
      website: 'https://www.goodancestors.org.au/',
      logo: '/logos/good-ancestors.svg',
    },
    {
      name: 'CSIRO (Data61)',
      lead: 'Liming Zhu',
      title: 'Director',
      website: 'https://www.csiro.au/en/about/people/business-units/data61',
      logo: '/logos/csiro.png',
    },
    {
      name: 'University of Sydney (Centre for AI, Trust and Governance)',
      lead: 'Kimberlee Weatherall',
      title: 'Co-Director',
      website: 'https://www.sydney.edu.au/arts/our-research/centres-institutes-and-groups/centre-for-ai-trust-and-governance.html',
      logo: '/logos/usyd.svg',
    },
    {
      name: 'Tech Policy Design Institute',
      lead: 'Johanna Weaver',
      title: 'Executive Director',
      website: 'https://techpolicy.au/',
      logo: '/logos/tpdi.png',
    },
    {
      name: 'Timaeus',
      lead: 'Daniel Murfet',
      title: 'Research Director',
      website: 'https://timaeus.co/',
      logo: '/logos/timaeus.png',
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-cream">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy via-brand-blue to-teal text-white py-20 px-8">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-serif text-[3rem] md:text-[4rem] font-bold mb-6">
              Become a Sponsor
            </h1>
            <p className="text-xl leading-relaxed mb-8 text-cyan-tint">
              Support Australia&apos;s premier gathering for AI safety researchers, policymakers, and industry leaders. Help advance evidence-based AI policy and foster the next generation of AI safety work.
            </p>
          </div>
        </section>

        {/* 2024 Impact */}
        <section className="bg-white py-16 px-8 border-b border-border">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
                PROVEN IMPACT
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-navy">
                2024 Forum Success
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {impactStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold text-brand-blue mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-lg text-body leading-relaxed max-w-[800px] mx-auto">
              The inaugural Australian AI Safety Forum in November 2024 brought together over 100 researchers, policymakers, and industry professionals from government, academia, industry, and civil society. The forum successfully presented foundational knowledge about AI safety issues and catalysed Australian work to address risks in advanced AI.
            </p>
          </div>
        </section>

        {/* Global Context */}
        <section className="bg-light py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
                THE LANDSCAPE
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-navy">
                A Critical Moment for AI Safety
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-3">
                  Global AI Governance
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  Australia released its National AI Plan and announced its AI Safety Institute. The EU AI Code of Practice is in effect, and California passed the Transparency in Frontier AI Act—both requiring safety protocols from powerful AI model developers.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-3">
                  AI Industry Growth
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  AI investments continue growing ($7 billion OpenAI/NextDC Sydney data centre, 63% of North American VC deals AI-related), with capabilities on track to saturate benchmarks by 2030, while risks escalate.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-teal">
                <h3 className="font-bold text-lg text-navy mb-3">
                  The Science of AI Safety
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  The International AI Safety Report was released shortly after the first forum. Two updates have since been released. The Second International AI Safety Report has now been released, providing an updated scientific foundation for the second Forum.
                </p>
              </div>
            </div>

            <p className="text-center text-lg text-body mt-8 font-semibold">
              The 2026 forum is an opportunity to take stock of these changes and prepare for what&apos;s to come.
            </p>
          </div>
        </section>

        {/* 2026 Forum Details */}
        <section className="bg-white py-16 px-8 border-b border-border">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
                2026 FORUM
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-navy">
                Building on Success
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-[900px] mx-auto">
              <div>
                <h3 className="font-bold text-xl text-navy mb-4">Mission</h3>
                <ul className="space-y-3 text-body">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Unite fragmented expertise across government, academia, and industry</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Strengthen Australia&apos;s role in international AI safety coordination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Build bridges between technical research and policy implementation</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-xl text-navy mb-4">Details</h3>
                <div className="space-y-4 text-body">
                  <div>
                    <div className="font-semibold text-brand-blue mb-1">Audience</div>
                    <p className="text-sm">100-300 attendees from government (federal and state), academia, industry, and civil society, including invited international speakers and Australian AI safety experts.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-brand-blue mb-1">Dates & Venue</div>
                    <p className="text-sm">22-23 June 2026 at The University of Sydney, Sydney, Australia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship Tiers */}
        <section className="bg-light py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
                SPONSORSHIP
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-navy">
                Sponsorship Opportunities
              </h2>
              <p className="text-muted mt-4 max-w-[700px] mx-auto">
                The forum operates on a lean budget with a volunteer organising committee, ensuring maximum impact from every sponsorship dollar.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {sponsorshipTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`bg-white rounded-lg p-8 ${
                    tier.highlight
                      ? 'border-2 border-teal shadow-lg transform md:scale-105'
                      : 'border border-border'
                  }`}
                >
                  <h3 className="font-serif text-2xl font-bold text-navy mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold text-brand-blue mb-6">
                    {tier.amount}
                  </div>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-body">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-8 border-l-4 border-teal max-w-[800px] mx-auto">
              <h3 className="font-bold text-lg text-navy mb-4">
                Your Sponsorship Supports
              </h3>
              <ul className="grid md:grid-cols-2 gap-4 text-body">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Venue hire and catering for 200+ attendees</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Professional event production</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Travel support for key participants</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Documentation and follow-up reports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Organising Committee */}
        <section className="bg-white py-16 px-8 border-b border-border">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
                LEADERSHIP
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-navy">
                Organising Committee
              </h2>
              <p className="text-muted mt-4">
                The forum is organised by a volunteer committee of leading experts in AI safety, governance, and policy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organisingCommittee.map((org) => (
                <div
                  key={org.name}
                  className="bg-light rounded-lg p-6 border-l-4 border-teal flex flex-col"
                >
                  {/* Logo */}
                  <div className="h-20 flex items-center justify-center mb-4 bg-white rounded border border-border p-4 relative">
                    <Image
                      src={org.logo}
                      alt={`${org.name} logo`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-navy hover:text-brand-blue transition-colors block mb-2"
                  >
                    {org.name}
                  </a>
                  <div className="text-sm text-muted mb-1">{org.lead}</div>
                  <div className="text-xs text-muted opacity-75">{org.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-navy via-brand-blue to-teal text-white py-20 px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-serif text-[2.5rem] font-bold mb-6">
              Partner With Us
            </h2>
            <p className="text-xl leading-relaxed mb-8 text-cyan-tint">
              Support at any level demonstrates leadership in fostering Australia&apos;s AI safety ecosystem and advancing evidence-based AI policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-navy rounded-md hover:bg-white/90 transition-colors"
              >
                Get in Touch
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
