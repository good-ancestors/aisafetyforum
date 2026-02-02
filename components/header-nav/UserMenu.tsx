'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import ProfileAvatar from '@/components/ProfileAvatar';

interface User {
  email: string;
}

interface UserProfile {
  name: string | null;
  avatarUrl: string | null;
}

interface UserMenuProps {
  user: User;
  profile: UserProfile | null;
  isAdmin: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
}

export default function UserMenu({
  user,
  profile,
  isAdmin,
  isOpen,
  onToggle,
  onClose,
  onSignOut,
}: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 text-[0.95rem] font-medium text-dark hover:text-brand-blue transition-colors rounded-md hover:bg-light"
      >
        <ProfileAvatar
          email={user.email}
          name={profile?.name}
          avatarUrl={profile?.avatarUrl}
          size="sm"
        />
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* User Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm text-muted">Signed in as</p>
            <p className="text-sm font-medium text-dark truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            prefetch={false}
            className="block px-4 py-2 text-sm text-dark hover:bg-light transition-colors"
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            prefetch={false}
            className="block px-4 py-2 text-sm text-dark hover:bg-light transition-colors"
            onClick={onClose}
          >
            Profile
          </Link>
          <Link
            href="/dashboard/tickets"
            prefetch={false}
            className="block px-4 py-2 text-sm text-dark hover:bg-light transition-colors"
            onClick={onClose}
          >
            My Tickets
          </Link>
          {isAdmin && (
            <>
              <div className="border-t border-border my-2" />
              <Link
                href="/admin/invoices"
                prefetch={false}
                className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-light transition-colors"
                onClick={onClose}
              >
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Admin</span>
                Admin Panel
              </Link>
            </>
          )}
          <div className="border-t border-border my-2" />
          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
