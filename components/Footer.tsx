import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[--navy-dark] text-white py-12 px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[--blue] to-[--navy] flex items-center justify-center relative">
            <div className="w-5 h-0.5 bg-[--cyan] shadow-[0_5px_0_var(--cyan),0_10px_0_var(--cyan)]"></div>
          </div>
          <div>
            <strong className="block text-base mb-1">AI Safety Forum Australia</strong>
            <span className="text-sm opacity-70">Organised by Good Ancestors Policy</span>
          </div>
        </div>
        <div className="flex gap-8">
          <Link href="#about" className="text-[rgba(255,255,255,0.7)] text-[0.95rem] hover:text-[--cyan] transition-colors">
            About
          </Link>
          <Link href="#" className="text-[rgba(255,255,255,0.7)] text-[0.95rem] hover:text-[--cyan] transition-colors">
            2024 Event
          </Link>
          <Link href="#contact" className="text-[rgba(255,255,255,0.7)] text-[0.95rem] hover:text-[--cyan] transition-colors">
            Contact
          </Link>
          <Link href="https://goodancestorspolicy.com" className="text-[rgba(255,255,255,0.7)] text-[0.95rem] hover:text-[--cyan] transition-colors">
            Good Ancestors Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
