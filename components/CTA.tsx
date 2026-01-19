import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative bg-gradient-to-br from-[#0a1f5c] to-[#0047ba] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

      <div className="max-w-[700px] mx-auto px-8 py-16 text-center relative">
        <h2 className="font-serif text-[2rem] mb-4">Join Us in November 2026</h2>
        <p className="text-lg opacity-90 mb-8">
          Be part of Australia&apos;s premier AI safety event. Register your interest to receive updates on speakers, program, and registration.
        </p>
        <Link href="#register" className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors">
          Register Your Interest
        </Link>
      </div>
    </section>
  );
}
