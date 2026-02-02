'use client';

import SectionHeading from './SectionHeading';
import { useInView } from '@/hooks/useInView';

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Timely & Relevant',
    description: "Learn about and discuss the launch of Australia's AI Safety Institute and the National AI Plan",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Evidence-Based',
    description: 'Technical discussions grounded in the International AI Safety Report and cutting-edge research',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Cross-Sector Collaboration',
    description: 'Connect with researchers, policymakers, and industry leaders to drive coordinated action',
  },
];

export default function About() {
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.1 });

  return (
    <section id="about" className="bg-white border-t border-b border-border">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <SectionHeading eyebrow="About the Forum" title="Why Attend" />

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

          <ul ref={ref} className="space-y-0">
            {features.map((feature, index) => (
              <li
                key={feature.title}
                className={`flex items-start gap-4 py-5 ${index < features.length - 1 ? 'border-b border-border' : ''} group hover:bg-light/50 -mx-4 px-4 rounded-lg transition-colors ${
                  inView ? 'animate-fade-in-up' : 'opacity-0'
                } stagger-${index + 1}`}
                style={{ animationFillMode: 'backwards' }}
              >
                <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-navy to-brand-blue flex items-center justify-center flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-cyan after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)] group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <strong className="block text-lg text-navy mb-1 group-hover:text-brand-blue transition-colors">{feature.title}</strong>
                  <span className="text-[0.95rem] text-muted leading-relaxed">
                    {feature.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
