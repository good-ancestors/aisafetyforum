import Image from 'next/image';

export default function Organisers() {
  const organisers = [
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

  const sponsors = [
    {
      name: 'Department of Industry, Science and Resources',
      type: 'Gold Sponsor',
      website: 'https://www.industry.gov.au/',
      logo: '/logos/disr.png',
    },
  ];

  return (
    <section className="bg-light py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Organisers */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
              ORGANISERS
            </div>
            <h2 className="font-serif text-[2rem] font-bold text-navy">
              Organising Committee
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organisers.map((org) => (
              <div
                key={org.name}
                className="bg-white rounded-lg p-6 shadow-sm border border-border flex flex-col"
              >
                {/* Logo */}
                <div className="h-20 flex items-center justify-center mb-4 bg-cream rounded border border-border p-4 relative">
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

        {/* Sponsors */}
        <div>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
              PARTNERS
            </div>
            <h2 className="font-serif text-[2rem] font-bold text-navy">
              Sponsors
            </h2>
          </div>

          <div className="flex flex-col items-center gap-8">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="bg-white rounded-lg p-8 shadow-sm border-2 border-teal max-w-md w-full"
              >
                {/* Logo */}
                <div className="h-24 flex items-center justify-center mb-6 bg-cream rounded p-4 relative">
                  <Image
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center">
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-lg text-navy hover:text-brand-blue transition-colors block mb-2"
                  >
                    {sponsor.name}
                  </a>
                  <div className="inline-block px-4 py-1 bg-gradient-to-r from-teal to-cyan text-white text-sm font-semibold rounded-full">
                    {sponsor.type}
                  </div>
                </div>
              </div>
            ))}

            {/* Become a Sponsor link */}
            <p className="text-sm text-muted mt-4">
              Interested in sponsoring? <a href="/sponsorship" className="text-brand-blue hover:text-teal underline font-medium">Learn about sponsorship opportunities</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
