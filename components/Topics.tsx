'use client';

import SectionHeading from './SectionHeading';
import { useInView } from '@/hooks/useInView';

const topics = [
  {
    number: '01',
    title: 'Technical AI Safety',
    description: 'Exploring alignment, interpretability, and robustness in advanced AI systems.',
  },
  {
    number: '02',
    title: 'AI Governance',
    description: 'Policy frameworks, regulatory approaches, and international coordination.',
  },
  {
    number: '03',
    title: "Australia's Role",
    description: 'How Australia can contribute to and shape global AI safety efforts.',
  },
  {
    number: '04',
    title: 'Risk Assessment',
    description: 'Identifying, evaluating, and mitigating risks from advanced AI systems.',
  },
  {
    number: '05',
    title: 'Evaluations & Testing',
    description: 'Measuring AI capabilities and developing robust safety benchmarks.',
  },
  {
    number: '06',
    title: 'Cross-Sector Dialogue',
    description: 'Bridging research, policy, and industry for effective collaboration.',
  },
];

export default function Topics() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="max-w-[1200px] mx-auto px-8 py-20">
      <SectionHeading eyebrow="Forum Topics" title="What We'll Explore" />

      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <div
            key={topic.number}
            className={`bg-white rounded-lg p-7 border border-border border-l-4 border-l-navy hover:border-l-cyan hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group ${
              inView ? 'animate-fade-in-up' : 'opacity-0'
            } stagger-${index + 1}`}
            style={{ animationFillMode: 'backwards' }}
          >
            <span className="absolute top-6 right-6 font-serif text-[2rem] font-bold text-border group-hover:text-cyan transition-colors">
              {topic.number}
            </span>
            <h3 className="text-lg font-bold text-navy mb-2 pr-8 group-hover:text-blue transition-colors">
              {topic.title}
            </h3>
            <p className="text-[0.95rem] text-muted leading-relaxed">{topic.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
