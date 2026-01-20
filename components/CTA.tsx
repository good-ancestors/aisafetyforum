import Link from 'next/link';
import { eventConfig } from '@/lib/config';

export default function CTA() {
  return (
    <section id="register" className="relative bg-gradient-to-br from-[#0a1f5c] to-[#0047ba] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

      <div className="max-w-[1200px] mx-auto px-8 py-16 relative">
        <div className="text-center mb-12">
          <h2 className="font-serif text-[2rem] mb-4">Join Us in {eventConfig.year}</h2>
          <p className="text-lg opacity-90 max-w-[700px] mx-auto">
            Be part of Australia&apos;s premier AI safety event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Register */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded border-2 border-[#00d4ff]"></div>
            </div>
            <h3 className="font-bold text-xl mb-3">Register</h3>
            <p className="text-sm opacity-90 mb-6">
              Secure your ticket for the forum. Early bird pricing available.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
              Register Now
            </Link>
          </div>

          {/* Propose a Talk */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mx-auto mb-4">
              <div className="flex flex-col gap-1">
                <div className="w-5 h-0.5 bg-[#00d4ff]"></div>
                <div className="w-5 h-0.5 bg-[#00d4ff]"></div>
                <div className="w-5 h-0.5 bg-[#00d4ff]"></div>
              </div>
            </div>
            <h3 className="font-bold text-xl mb-3">Propose a Talk</h3>
            <p className="text-sm opacity-90 mb-6">
              Share your expertise. Submit a keynote, workshop, or lightning talk proposal.
            </p>
            <Link href="/speak" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
              Submit Proposal
            </Link>
          </div>

          {/* Apply for Funding */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/30 flex items-center justify-center mx-auto mb-4">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 border-2 border-[#00d4ff] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00d4ff] text-xs font-bold">$</div>
              </div>
            </div>
            <h3 className="font-bold text-xl mb-3">Apply for Funding</h3>
            <p className="text-sm opacity-90 mb-6">
              Limited travel and accommodation support available for attendees.
            </p>
            <Link href="/funding" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
