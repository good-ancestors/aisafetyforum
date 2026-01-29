'use client';

import Link from 'next/link';
import { eventConfig } from '@/lib/config';
import { useInView } from '@/hooks/useInView';

const ctaCards = [
  {
    icon: <div className="w-6 h-6 rounded border-2 border-cyan" />,
    title: 'Register',
    description: 'Secure your ticket for the forum. Early bird pricing available.',
    href: '/register',
    buttonText: 'Register Now',
  },
  {
    icon: (
      <div className="flex flex-col gap-1">
        <div className="w-5 h-0.5 bg-cyan" />
        <div className="w-5 h-0.5 bg-cyan" />
        <div className="w-5 h-0.5 bg-cyan" />
      </div>
    ),
    title: 'Propose a Talk',
    description: 'Share your expertise. Submit a keynote, workshop, or lightning talk proposal.',
    href: '/speak',
    buttonText: 'Submit Proposal',
  },
  {
    icon: (
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 border-2 border-cyan rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan text-xs font-bold">$</div>
      </div>
    ),
    title: 'Apply for Scholarship',
    description: 'Scholarships with travel and accommodation support available.',
    href: '/scholarships',
    buttonText: 'Apply Now',
  },
];

export default function CTA() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="register" className="relative bg-gradient-to-br from-navy to-brand-blue text-white overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />

      <div className="max-w-[1200px] mx-auto px-8 py-16 relative">
        <div className="text-center mb-12">
          <h2 className="font-serif text-[2rem] mb-4">Join Us in {eventConfig.year}</h2>
          <p className="text-lg opacity-90 max-w-[700px] mx-auto">
            Be part of Australia&apos;s premier AI safety event.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ctaCards.map((card, index) => (
            <div
              key={card.title}
              className={`group bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/20 hover:border-cyan/40 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,212,255,0.15)] transition-all duration-300 ${
                inView ? 'animate-fade-in-up' : 'opacity-0'
              } stagger-${index + 1}`}
              style={{ animationFillMode: 'backwards' }}
            >
              <div className="w-12 h-12 rounded-lg bg-cyan/20 border border-cyan/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-cyan/30 transition-all">
                {card.icon}
              </div>
              <h3 className="font-bold text-xl mb-3">{card.title}</h3>
              <p className="text-sm opacity-90 mb-6">
                {card.description}
              </p>
              <Link href={card.href} className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-bold bg-white text-navy rounded-md hover:bg-cyan hover:text-white transition-colors">
                {card.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
