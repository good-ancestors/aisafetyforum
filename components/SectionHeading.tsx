'use client';

import { useInView } from '@/hooks/useInView';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className="mb-12">
      <div
        className={`text-xs font-semibold text-teal uppercase tracking-widest mb-2 transition-all duration-500 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {eyebrow}
      </div>
      <h2
        className={`font-serif text-[2rem] font-bold text-navy inline-block relative pb-4 animated-underline ${
          inView ? 'in-view' : ''
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
