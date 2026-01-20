import Link from 'next/link';

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
  return (
    <section className="max-w-[1200px] mx-auto px-8 py-20">
      <div className="mb-12">
        <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">Forum Topics</div>
        <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c] inline-block relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#0a1f5c] after:to-[#00d4ff]">
          What We&apos;ll Explore
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.number}
            className="bg-white rounded-lg p-7 border border-[#e0e4e8] border-l-4 border-l-[#0a1f5c] hover:border-l-[#00d4ff] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative group"
          >
            <span className="absolute top-6 right-6 font-serif text-[2rem] font-bold text-[#e0e4e8] group-hover:text-[#00d4ff] transition-colors">
              {topic.number}
            </span>
            <h3 className="text-lg font-bold text-[#0a1f5c] mb-2 pr-8 group-hover:text-[--blue] transition-colors">
              {topic.title}
            </h3>
            <p className="text-[0.95rem] text-[#5c6670] leading-relaxed">{topic.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
