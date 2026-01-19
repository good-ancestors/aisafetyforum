import Link from 'next/link';

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

      <div className="max-w-[1200px] mx-auto px-8 py-20 relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div className="max-w-[600px]">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] px-4 py-2 rounded text-sm font-semibold mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 bg-[#00d4ff] rounded-full shadow-[0_0_10px_var(--cyan)]"></span>
            Second Annual Forum · 2026
          </div>
          <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] font-bold leading-tight mb-6">
            Charting Australia&apos;s Course in AI Safety and Governance
          </h1>
          <p className="text-lg leading-relaxed opacity-90 mb-8">
            Join leading researchers, policymakers, and industry experts for two days of rigorous dialogue on the future of AI safety in Australia.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="#register" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
              Register Interest
            </Link>
            <Link href="#" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] bg-transparent text-white border-2 border-[rgba(255,255,255,0.4)] rounded-md hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.8)] transition-colors">
              View 2024 Highlights
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.3)] text-[#1a1a1a]">
          <div className="relative bg-gradient-to-br from-[#0047ba] to-[#0099cc] text-white p-6">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#00d4ff] opacity-20 rounded-bl-[100px]"></div>
            <div className="font-serif text-2xl font-bold mb-1">November 2026</div>
            <div className="opacity-90 text-[0.95rem]">Sydney, Australia</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-[#f0f4f8] rounded-lg">
                <div className="font-serif text-[1.75rem] font-bold text-[#0a1f5c]">2</div>
                <div className="text-xs text-[#5c6670] uppercase tracking-wider">Days</div>
              </div>
              <div className="text-center p-4 bg-[#f0f4f8] rounded-lg">
                <div className="font-serif text-[1.75rem] font-bold text-[#0a1f5c]">30+</div>
                <div className="text-xs text-[#5c6670] uppercase tracking-wider">Speakers</div>
              </div>
              <div className="text-center p-4 bg-[#f0f4f8] rounded-lg">
                <div className="font-serif text-[1.75rem] font-bold text-[#0a1f5c]">300+</div>
                <div className="text-xs text-[#5c6670] uppercase tracking-wider">Attendees</div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link href="#register" className="flex items-center justify-center w-full gap-2 px-6 py-3 text-[0.95rem] font-bold bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#061440] rounded-md hover:from-[#00b8e0] hover:to-[#0099cc] transition-all">
              Register Your Interest
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
