import Link from 'next/link';

export default function Header() {
  return (
    <>
      <div className="bg-[#061440] text-white text-sm py-2">
        <div className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
          <span>Australian AI Safety Forum 2026</span>
          <Link href="#" className="text-[#00d4ff] font-medium hover:opacity-80 transition-opacity">
            View 2024 Forum Highlights →
          </Link>
        </div>
      </div>

      <header className="bg-white border-b border-[#e0e4e8] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#0047ba] to-[#0a1f5c] flex items-center justify-center relative overflow-hidden">
              <div className="flex flex-col gap-1 items-start pl-2">
                <div className="h-[3px] w-5 bg-[#00d4ff] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[#00d4ff] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[26px] bg-[#00d4ff] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[#00d4ff] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[22px] bg-[#00d4ff] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[#00d4ff] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[18px] bg-[#00d4ff] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[#00d4ff] before:rounded-full before:mr-0.5 before:align-middle"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[1.3rem] text-[#0a1f5c] tracking-tight">AI</span>
              <div className="w-0.5 h-7 bg-[#a8b0b8]"></div>
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-base text-[#0047ba] tracking-wide">SAFETY</span>
                <span className="font-bold text-[0.7rem] text-[#0a1f5c] tracking-[0.15em]">FORUM</span>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <ul className="flex list-none">
              <li><Link href="#about" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">About</Link></li>
              <li><Link href="#program" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Program</Link></li>
              <li><Link href="#speakers" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Speakers</Link></li>
              <li><Link href="#" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">2024 Forum</Link></li>
              <li><Link href="#contact" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Contact</Link></li>
            </ul>
            <Link href="#register" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-semibold bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors">
              Register Interest
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
