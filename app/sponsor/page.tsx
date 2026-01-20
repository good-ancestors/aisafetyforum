import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    { value: '76%', label: 'Increased understanding of Australia\'s role' },
    { value: '92%', label: 'Increased connection with AI safety community' },
    { value: '85%', label: 'Rated experience as good or very good' },
  ];

  const sponsors = [
    {
      name: 'Department of Industry, Science and Resources',
      logo: '/logos/disr.png',
      website: 'https://www.industry.gov.au/',
    },
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
      name: 'Good Ancestors Policy',
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
      <main className="bg-[#f9fafb]">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0a1f5c] via-[#0047ba] to-[#0099cc] text-white py-20 px-8">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-serif text-[3rem] md:text-[4rem] font-bold mb-6">
              Become a Sponsor
            </h1>
            <p className="text-xl leading-relaxed mb-8 text-[#e0f2ff]">
              Support Australia's premier gathering for AI safety researchers, policymakers, and industry leaders. Help advance evidence-based AI policy and foster the next generation of AI safety work.
            </p>
          </div>
        </section>

        {/* 2024 Impact */}
        <section className="bg-white py-16 px-8 border-b border-[#e0e4e8]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                PROVEN IMPACT
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c]">
                2024 Forum Success
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-[#0047ba] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#5c6670] leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-lg text-[#333333] leading-relaxed max-w-[800px] mx-auto">
              The inaugural Australian AI Safety Forum in November 2024 brought together over 100 researchers, policymakers, and industry professionals from government, academia, industry, and civil society. The forum successfully presented foundational knowledge about AI safety issues and catalysed Australian work to address risks in advanced AI.
            </p>
          </div>
        </section>

        {/* Global Context */}
        <section className="bg-[#f0f4f8] py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                THE LANDSCAPE
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c]">
                A Critical Moment for AI Safety
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 border-l-4 border-[#0099cc]">
                <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">
                  Global AI Governance
                </h3>
                <p className="text-[#5c6670] text-sm leading-relaxed">
                  Australia released its National AI Plan and announced its AI Safety Institute. The EU AI Code of Practice is in effect, and California passed the Transparency in Frontier AI Act—both requiring safety protocols from powerful AI model developers.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-[#0099cc]">
                <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">
                  AI Industry Growth
                </h3>
                <p className="text-[#5c6670] text-sm leading-relaxed">
                  AI investments continue growing ($7 billion OpenAI/NextDC Sydney data centre, 63% of North American VC deals AI-related), with capabilities on track to saturate benchmarks by 2030, while risks escalate.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-[#0099cc]">
                <h3 className="font-bold text-lg text-[#0a1f5c] mb-3">
                  The Science of AI Safety
                </h3>
                <p className="text-[#5c6670] text-sm leading-relaxed">
                  The International AI Safety Report was released shortly after the first forum. Two updates have since been released, and a second full report will be released before the next forum, providing an updated scientific foundation.
                </p>
              </div>
            </div>

            <p className="text-center text-lg text-[#333333] mt-8 font-semibold">
              The 2026 forum is an opportunity to take stock of these changes and prepare for what's to come.
            </p>
          </div>
        </section>

        {/* 2026 Forum Details */}
        <section className="bg-white py-16 px-8 border-b border-[#e0e4e8]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                2026 FORUM
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c]">
                Building on Success
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-[900px] mx-auto">
              <div>
                <h3 className="font-bold text-xl text-[#0a1f5c] mb-4">Mission</h3>
                <ul className="space-y-3 text-[#333333]">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Unite fragmented expertise across government, academia, and industry</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Strengthen Australia's role in international AI safety coordination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Build bridges between technical research and policy implementation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Raise the profile of Australia's new AI Safety Institute</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-xl text-[#0a1f5c] mb-4">Details</h3>
                <div className="space-y-4 text-[#333333]">
                  <div>
                    <div className="font-semibold text-[#0047ba] mb-1">Audience</div>
                    <p className="text-sm">100-300 attendees from government (federal and state), academia, industry, and civil society, including invited international speakers and Australian AI safety experts.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-[#0047ba] mb-1">Dates & Venue</div>
                    <p className="text-sm">Sydney University in June or July, or Melbourne Abbotsford Convent 8-9 May (coinciding with Wisdom & Action Forum 2026: Trust in the Age of AI).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship Tiers */}
        <section className="bg-[#f0f4f8] py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                SPONSORSHIP
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c]">
                Sponsorship Opportunities
              </h2>
              <p className="text-[#5c6670] mt-4 max-w-[700px] mx-auto">
                The forum operates on a lean budget with a volunteer organising committee, ensuring maximum impact from every sponsorship dollar.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {sponsorshipTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-8 ${
                    tier.highlight
                      ? 'border-2 border-[#0099cc] shadow-lg transform md:scale-105'
                      : 'border border-[#e0e4e8]'
                  }`}
                >
                  <h3 className="font-serif text-2xl font-bold text-[#0a1f5c] mb-2">
                    {tier.name}
                  </h3>
                  <div className="text-3xl font-bold text-[#0047ba] mb-6">
                    {tier.amount}
                  </div>
                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-[#333333]">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-8 border-l-4 border-[#0099cc] max-w-[800px] mx-auto">
              <h3 className="font-bold text-lg text-[#0a1f5c] mb-4">
                Your Sponsorship Supports
              </h3>
              <ul className="grid md:grid-cols-2 gap-4 text-[#333333]">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Venue hire and catering for 200+ attendees</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Professional event production</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Travel support for key participants</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[#0099cc] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Documentation and follow-up reports</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Organising Committee */}
        <section className="bg-white py-16 px-8 border-b border-[#e0e4e8]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                LEADERSHIP
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c]">
                Organising Committee
              </h2>
              <p className="text-[#5c6670] mt-4">
                The forum is organised by a volunteer committee of leading experts in AI safety, governance, and policy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organisingCommittee.map((org, index) => (
                <div
                  key={index}
                  className="bg-[#f0f4f8] rounded-lg p-6 border-l-4 border-[#0099cc] flex flex-col"
                >
                  {/* Logo */}
                  <div className="h-20 flex items-center justify-center mb-4 bg-white rounded border border-[#e0e4e8] p-4">
                    <img
                      src={org.logo}
                      alt={`${org.name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0a1f5c] hover:text-[#0047ba] transition-colors block mb-2"
                  >
                    {org.name}
                  </a>
                  <div className="text-sm text-[#5c6670] mb-1">{org.lead}</div>
                  <div className="text-xs text-[#5c6670] opacity-75">{org.title}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#0a1f5c] via-[#0047ba] to-[#0099cc] text-white py-20 px-8">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-serif text-[2.5rem] font-bold mb-6">
              Partner With Us
            </h2>
            <p className="text-xl leading-relaxed mb-8 text-[#e0f2ff]">
              Support at any level demonstrates leadership in fostering Australia's AI safety ecosystem and advancing evidence-based AI policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@aisafetyforum.au"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-[#0a1f5c] rounded-md hover:bg-[#e0f2ff] transition-colors"
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
