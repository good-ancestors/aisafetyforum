'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface HeaderClientProps {
  user: {
    email: string;
  } | null;
  isAdmin: boolean;
}

export default function HeaderClient({ user, isAdmin }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <li>
                <Link href="/program" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                  Program
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                  Speakers
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/sponsorship" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                  Sponsorship
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                  Contact
                </Link>
              </li>
            </ul>

            {/* Register Button - always visible */}
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-semibold bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors"
            >
              Register
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-[0.95rem] font-medium text-[#1a1a1a] hover:text-[#0047ba] transition-colors rounded-md hover:bg-[#f0f4f8]"
                >
                  <span className="w-8 h-8 bg-[#0a1f5c] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#e0e4e8] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#e0e4e8]">
                      <p className="text-sm text-[#5c6670]">Signed in as</p>
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/tickets"
                      className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Tickets
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-[#e0e4e8] my-2" />
                        <Link
                          href="/admin/invoices"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Admin</span>
                          Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="border-t border-[#e0e4e8] my-2" />
                    <Link
                      href="/api/auth/sign-out"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="px-4 py-2 text-[0.95rem] font-medium text-[#1a1a1a] hover:text-[#0047ba] transition-colors"
              >
                Sign in
              </Link>
            )}
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
                  href="/scholarships"
                  className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Scholarships
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsorship"
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

              {/* Mobile Auth Section */}
              {user ? (
                <>
                  <li className="border-t border-[#e0e4e8] mt-2 pt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs text-[#5c6670]">Signed in as</p>
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.email}</p>
                    </div>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/profile"
                      className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/tickets"
                      className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Tickets
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        href="/admin/invoices"
                        className="flex items-center gap-2 text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Admin</span>
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li className="p-4 pt-2">
                    <Link
                      href="/api/auth/sign-out"
                      className="block text-center px-6 py-3 text-[0.95rem] font-semibold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign out
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="border-t border-[#e0e4e8] mt-2">
                    <Link
                      href="/auth/sign-in"
                      className="block text-[#1a1a1a] px-4 py-3 font-medium text-[0.95rem] hover:bg-[#f0f4f8] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
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
                </>
              )}
            </ul>
          </nav>
        )}
      </header>

    </>
  );
}
