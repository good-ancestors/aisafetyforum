import Link from 'next/link';

export default function Header() {
  return (
    <>
      <div className="bg-[--navy-dark] text-white text-sm py-2">
        <div className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
          <span>Australian AI Safety Forum 2026</span>
          <Link href="#" className="text-[--cyan] font-medium hover:opacity-80 transition-opacity">
            View 2024 Forum Highlights →
          </Link>
        </div>
      </div>

      <header className="bg-white border-b border-[--border] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[--blue] to-[--navy] flex items-center justify-center relative overflow-hidden">
              <div className="flex flex-col gap-1 items-start pl-2">
                <div className="h-[3px] w-5 bg-[--cyan] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[--cyan] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[26px] bg-[--cyan] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[--cyan] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[22px] bg-[--cyan] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[--cyan] before:rounded-full before:mr-0.5 before:align-middle"></div>
                <div className="h-[3px] w-[18px] bg-[--cyan] rounded-sm before:content-[''] before:inline-block before:w-[3px] before:h-[3px] before:bg-[--cyan] before:rounded-full before:mr-0.5 before:align-middle"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-[--font-public-sans] font-extrabold text-[1.3rem] text-[--navy] tracking-tight">AI</span>
              <div className="w-0.5 h-7 bg-[--grey]"></div>
              <div className="flex flex-col leading-tight">
                <span className="font-[--font-public-sans] font-extrabold text-base text-[--blue] tracking-wide">SAFETY</span>
                <span className="font-[--font-public-sans] font-bold text-[0.7rem] text-[--navy] tracking-[0.15em]">FORUM</span>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <ul className="flex list-none">
              <li><Link href="#about" className="text-[--text-dark] px-5 py-3 font-medium text-[0.95rem] hover:text-[--blue] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[--cyan] after:opacity-0 hover:after:opacity-100 after:transition-opacity">About</Link></li>
              <li><Link href="#program" className="text-[--text-dark] px-5 py-3 font-medium text-[0.95rem] hover:text-[--blue] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[--cyan] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Program</Link></li>
              <li><Link href="#speakers" className="text-[--text-dark] px-5 py-3 font-medium text-[0.95rem] hover:text-[--blue] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[--cyan] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Speakers</Link></li>
              <li><Link href="#" className="text-[--text-dark] px-5 py-3 font-medium text-[0.95rem] hover:text-[--blue] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[--cyan] after:opacity-0 hover:after:opacity-100 after:transition-opacity">2024 Forum</Link></li>
              <li><Link href="#contact" className="text-[--text-dark] px-5 py-3 font-medium text-[0.95rem] hover:text-[--blue] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[--cyan] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Contact</Link></li>
            </ul>
            <Link href="#register" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-semibold bg-[--navy] text-white rounded-md hover:bg-[--navy-dark] transition-colors">
              Register Interest
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
