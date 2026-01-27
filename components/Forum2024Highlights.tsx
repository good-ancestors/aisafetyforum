import Link from 'next/link';

export default function Forum2024Highlights() {
  return (
    <section className="bg-gradient-to-br from-navy to-brand-blue text-white py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] px-4 py-2 rounded text-sm font-semibold mb-4 uppercase tracking-wider">
            <span className="w-2 h-2 bg-cyan rounded-full shadow-[0_0_10px_var(--cyan)]" />
            2024 Inaugural Event
          </div>
          <h2 className="font-serif text-[2.5rem] font-bold mb-4">
            Building Australia&apos;s AI Safety Community
          </h2>
          <p className="text-lg opacity-90 max-w-[700px] mx-auto">
            Our 2024 forum brought together 100+ participants and catalysed immediate action across the Australian AI safety landscape
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-[3rem] font-serif font-bold text-cyan mb-2">90%+</div>
            <div className="font-semibold mb-2">Networking Success</div>
            <p className="text-sm opacity-80">
              Attendees successfully met their goal of connecting with others in the Australian AI safety community
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-[3rem] font-serif font-bold text-cyan mb-2">70%</div>
            <div className="font-semibold mb-2">Knowledge Growth</div>
            <p className="text-sm opacity-80">
              Increased understanding of AI safety science, governance approaches, and Australia&apos;s role
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-[3rem] font-serif font-bold text-cyan mb-2">170</div>
            <div className="font-semibold mb-2">High Demand</div>
            <p className="text-sm opacity-80">
              Total applicants for 100 spaces, demonstrating strong appetite for AI safety work in Australia
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10 mb-8">
          <h3 className="font-serif text-xl font-bold mb-4 text-cyan">Immediate Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm opacity-90">AI safety coworking spaces launched in Sydney and Melbourne</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm opacity-90">Research project on open source AI infrastructure initiated</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm opacity-90">Ongoing working group formed to coordinate community efforts</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/2024"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-white text-navy rounded-md hover:bg-white/90 transition-colors"
          >
            View Full 2024 Report →
          </Link>
        </div>
      </div>
    </section>
  );
}
