'use client';

import { useInView } from '@/hooks/useInView';

export default function Program() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="program" className="bg-white py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
            PROGRAM
          </div>
          <h2 className="font-serif text-[2rem] font-bold text-navy mb-4">
            Two-Day Format
          </h2>
          <p className="text-muted max-w-[700px] mx-auto">
            Detailed program to be announced. Here&apos;s the structure for the 2026 forum.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Day 1 */}
          <div
            className={`bg-gradient-to-br from-navy to-brand-blue rounded-lg p-8 text-white hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,71,186,0.3)] transition-all duration-300 ${
              inView ? 'animate-fade-in-up' : 'opacity-0'
            } stagger-1`}
            style={{ animationFillMode: 'backwards' }}
          >
            <div className="text-cyan font-bold text-sm mb-3 uppercase tracking-wider">
              Day 1 • Monday 22 June
            </div>
            <h3 className="font-serif text-2xl font-bold mb-6">
              Single-Track Program
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-start gap-3">
                <span className="text-cyan mt-1">•</span>
                <span>Keynote speeches from leading AI safety experts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan mt-1">•</span>
                <span>Panel discussions on technical and governance challenges</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan mt-1">•</span>
                <span>Introduction to AI safety from different perspectives</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan mt-1">•</span>
                <span>Evening networking reception</span>
              </li>
            </ul>
          </div>

          {/* Day 2 */}
          <div
            className={`bg-light rounded-lg p-8 border-2 border-teal hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,153,204,0.2)] hover:border-cyan transition-all duration-300 ${
              inView ? 'animate-fade-in-up' : 'opacity-0'
            } stagger-2`}
            style={{ animationFillMode: 'backwards' }}
          >
            <div className="text-teal font-bold text-sm mb-3 uppercase tracking-wider">
              Day 2 • Tuesday 23 June
            </div>
            <h3 className="font-serif text-2xl font-bold mb-6 text-navy">
              Parallel Workshops
            </h3>
            <ul className="space-y-3 text-sm text-body">
              <li className="flex items-start gap-3">
                <span className="text-teal mt-1">•</span>
                <span>Collaborative sessions on key AI safety questions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal mt-1">•</span>
                <span>Focus on Australia&apos;s potential contributions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal mt-1">•</span>
                <span>Lightning talks and breakout discussions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal mt-1">•</span>
                <span>Networking and collaboration opportunities</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted text-sm">
            Full program will be published closer to the event
          </p>
        </div>
      </div>
    </section>
  );
}
