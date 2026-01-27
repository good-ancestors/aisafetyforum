export default function About() {
  return (
    <section id="about" className="bg-white border-t border-b border-border">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="mb-12">
          <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">About the Forum</div>
          <h2 className="font-serif text-[2rem] font-bold text-navy inline-block relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-navy after:to-cyan">
            Why Attend
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-body">
              <strong>Connect with Australia&apos;s AI safety community.</strong> Meet the researchers, policymakers, and practitioners shaping Australia&apos;s response to AI risks. Build relationships that matter—92% of 2024 attendees reported increased connection with the Australian AI safety community.
            </p>
            <p className="text-lg leading-relaxed text-body">
              <strong>Engage with Australia&apos;s emerging AI safety infrastructure.</strong> With the launch of Australia&apos;s{' '}
              <a href="https://www.industry.gov.au/news/australia-establish-new-institute-strengthen-ai-safety" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-teal underline transition-colors">
                AI Safety Institute
              </a>, join discussions on how technical research informs policy development, grounded in the{' '}
              <a href="https://internationalaisafetyreport.org/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-teal underline transition-colors">
                International AI Safety Report
              </a>.
            </p>
            <p className="text-lg leading-relaxed text-body">
              <strong>Bridge the gap between research and action.</strong> The{' '}
              <a href="/2024" className="text-brand-blue hover:text-teal underline transition-colors">
                2024 forum
              </a>{' '}
              catalysed immediate collaborations. Join us to turn technical insights into practical governance, policy into implementable systems, and conversations into coordinated action.
            </p>
          </div>

          <ul className="space-y-0">
            <li className="flex items-start gap-4 py-5 border-b border-border">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-navy to-brand-blue flex items-center justify-center flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-cyan after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <strong className="block text-lg text-navy mb-1">Timely & Relevant</strong>
                <span className="text-[0.95rem] text-muted leading-relaxed">
                  Support the launch of Australia&apos;s AI Safety Institute and shape the nation&apos;s AI safety strategy
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4 py-5 border-b border-border">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-navy to-brand-blue flex items-center justify-center flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-cyan after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <strong className="block text-lg text-navy mb-1">Evidence-Based</strong>
                <span className="text-[0.95rem] text-muted leading-relaxed">
                  Technical discussions grounded in the International AI Safety Report and cutting-edge research
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4 py-5">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-navy to-brand-blue flex items-center justify-center flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-cyan after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <strong className="block text-lg text-navy mb-1">Cross-Sector Collaboration</strong>
                <span className="text-[0.95rem] text-muted leading-relaxed">
                  Connect with researchers, policymakers, and industry leaders to drive coordinated action
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
