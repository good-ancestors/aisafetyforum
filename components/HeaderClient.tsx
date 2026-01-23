'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
import AuthModal from './AuthModal';
import { MobileNav, UserMenu } from './header-nav';

interface HeaderClientProps {
  user: {
    email: string;
  } | null;
  isAdmin: boolean;
}

const navLinks = [
  { href: '/program', label: 'Program' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/sponsorship', label: 'Sponsorship' },
  { href: '/contact', label: 'Contact' },
];

export default function HeaderClient({ user, isAdmin }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

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
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#1a1a1a] px-5 py-3 font-medium text-[0.95rem] hover:text-[#0047ba] transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-0.5 after:bg-[#00d4ff] after:opacity-0 hover:after:opacity-100 after:transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
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
              <UserMenu
                user={user}
                isAdmin={isAdmin}
                isOpen={isUserMenuOpen}
                onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onClose={() => setIsUserMenuOpen(false)}
                onSignOut={handleSignOut}
              />
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-dashed border-[#a8b0b8] flex items-center justify-center text-[#a8b0b8] hover:border-[#0047ba] hover:text-[#0047ba] transition-colors"
                aria-label="Sign in"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
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
        <MobileNav
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
