import Image from 'next/image';

export default function Footer() {
  const sponsors = [
    {
      name: 'Department of Industry, Science and Resources',
      logo: '/logos/disr.png',
      website: 'https://www.industry.gov.au/',
    },
  ];

  return (
    <footer className="bg-[#061440] text-white py-10 px-8">
      <div className="max-w-[900px] mx-auto text-center">
        {/* Sponsor Appreciation */}
        <p className="text-sm opacity-80 mb-4">
          We appreciate the support of our <a href="/sponsor" className="underline hover:text-[#00d4ff]">sponsors</a>:
        </p>

        {/* Sponsor Logos */}
        <div className="flex justify-center gap-4 mb-8">
          {sponsors.map((sponsor, index) => (
            <a
              key={index}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded p-3 hover:bg-[#f0f4f8] transition-colors relative h-16 w-40"
            >
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                fill
                className="object-contain p-2"
              />
            </a>
          ))}
        </div>

        {/* Editorial Independence */}
        <p className="text-sm opacity-80 leading-relaxed mb-6">
          The Australian AI Safety Forum does not represent the views of sponsors. Logistical and editorial decisions are solely the purview of the independent organising committee.
        </p>

        {/* Organization Info */}
        <p className="text-sm opacity-80 leading-relaxed mb-4">
          The forum is organised by a volunteer committee and operated by <a href="https://www.gradientinstitute.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#00d4ff]">Gradient Institute</a>, an Australian charity registered with the ACNC. Unspent funds will go to future forums or supporting domestic AI safety programmes.
        </p>

        {/* Acknowledgement of Country */}
        <p className="text-sm opacity-80 leading-relaxed italic mb-6">
          We acknowledge the Traditional Custodians of country throughout Australia and their connections to land, sea and community.
        </p>

        {/* Copyright */}
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} Australian AI Safety Forum · <a href="https://www.gradientinstitute.org/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d4ff]">Privacy</a>
        </p>
      </div>
    </footer>
  );
}
