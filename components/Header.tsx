'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-[#e0e4e8] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="AI Safety Forum Australia"
              width={400}
              height={200}
              className="h-[40px] sm:h-[60px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <ul className="flex list-none">
              <li><Link href="/program" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Program</Link></li>
              <li><Link href="/speakers" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Speakers</Link></li>
              <li><Link href="/scholarship" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Scholarships</Link></li>
              <li><Link href="/sponsor" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Sponsorship</Link></li>
              <li><Link href="/contact" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">Contact</Link></li>
            </ul>
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-semibold bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors">
              Register
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#0a1f5c]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-[#e0e4e8] bg-white">
            <ul className="flex flex-col list-none">
              <li>
                <Link
                  href="/program"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Program
                </Link>
              </li>
              <li>
                <Link
                  href="/speakers"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Speakers
                </Link>
              </li>
              <li>
                <Link
                  href="/scholarship"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Scholarships
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsor"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sponsorship
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li className="p-4 pt-2">
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 text-[0.95rem] font-semibold bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
