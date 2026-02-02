'use client';

import Link from 'next/link';
import ProfileAvatar from '@/components/ProfileAvatar';

interface User {
  email: string;
}

interface UserProfile {
  name: string | null;
  avatarUrl: string | null;
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
}

const navLinks = [
  { href: '/program', label: 'Program' },
  { href: '/speakers', label: 'Speakers' },
  { href: '/scholarships', label: 'Scholarships' },
  { href: '/sponsorship', label: 'Sponsorship' },
  { href: '/contact', label: 'Contact' },
];

export default function MobileNav({
  isOpen,
  onClose,
  user,
  profile,
  isAdmin,
  onSignOut,
  onOpenAuthModal,
}: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <nav className="md:hidden border-t border-border bg-white animate-slide-in-left">
      <ul className="flex flex-col list-none">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className="block text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors"
              onClick={onClose}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {/* Mobile Auth Section */}
        {user ? (
          <>
            <li className="border-t border-border mt-2 pt-2">
              <div className="px-4 py-2 flex items-center gap-3">
                <ProfileAvatar
                  email={user.email}
                  name={profile?.name}
                  avatarUrl={profile?.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="text-sm font-medium text-dark truncate">{user.email}</p>
                </div>
              </div>
            </li>
            <li>
              <Link
                href="/dashboard"
                prefetch={false}
                className="block text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors"
                onClick={onClose}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/profile"
                prefetch={false}
                className="block text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors"
                onClick={onClose}
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/tickets"
                prefetch={false}
                className="block text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors"
                onClick={onClose}
              >
                My Tickets
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin/invoices"
                  prefetch={false}
                  className="flex items-center gap-2 text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors"
                  onClick={onClose}
                >
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Admin</span>
                  Admin Panel
                </Link>
              </li>
            )}
            <li className="p-4 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="block w-full text-center px-6 py-3 text-[0.95rem] font-semibold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="border-t border-border mt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full text-left text-dark px-4 py-3 font-medium text-[0.95rem] hover:bg-light transition-colors flex items-center gap-3"
              >
                <span className="w-8 h-8 rounded-full border-2 border-dashed border-grey flex items-center justify-center text-grey">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Sign in
              </button>
            </li>
            <li className="p-4 pt-2">
              <Link
                href="/register"
                prefetch={false}
                className="block text-center px-6 py-3 text-[0.95rem] font-semibold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
                onClick={onClose}
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
