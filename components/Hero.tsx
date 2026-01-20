import Link from 'next/link';
import { eventConfig } from '@/lib/config';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#0a1f5c] via-[#1a3a8f] to-[#0047ba] text-white overflow-hidden">
      {/* Geometric background shapes */}
      <div className="absolute inset-0 overflow-hidden opacity-12">
        <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-[#00d4ff] -top-[100px] right-[10%] animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute w-[200px] h-[200px] border-2 border-[#00d4ff] top-[60%] right-[5%] rotate-45 animate-[float_15s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute w-[150px] h-[150px] rounded-full border-2 border-[#00d4ff] -bottom-[50px] left-[5%] animate-[float_18s_ease-in-out_infinite]"></div>
        <div className="absolute w-[100px] h-[100px] border-2 border-[#00d4ff] top-[20%] left-[15%] rotate-[15deg] animate-[float_12s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute w-20 h-20 rounded-full bg-[#00d4ff] top-[30%] right-[35%] opacity-40"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[length:60px_60px]"></div>

      <div className="max-w-[800px] mx-auto px-8 py-20 relative text-center">
        <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] px-4 py-2 rounded text-sm font-semibold mb-6 uppercase tracking-wider">
          <span className="w-2 h-2 bg-[#00d4ff] rounded-full shadow-[0_0_10px_var(--cyan)]"></span>
          {eventConfig.year} Forum
        </div>
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-tight mb-6">
          Charting Australia&apos;s Course in AI Safety and Governance
        </h1>
        <p className="text-xl leading-relaxed opacity-90 mb-4">
          {eventConfig.datesLong} · {eventConfig.venueLong}
        </p>
        <p className="text-lg leading-relaxed opacity-90 mb-10 max-w-[700px] mx-auto">
          Join leading researchers, policymakers, and industry experts for two days of rigorous dialogue on the future of AI safety in Australia, grounded in the science of AI safety as explored in the <a href="https://internationalaisafetyreport.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#00d4ff]">International AI Safety Report</a>.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="#register" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
            Join Us
          </Link>
        </div>
      </div>
    </section>
  );
}
