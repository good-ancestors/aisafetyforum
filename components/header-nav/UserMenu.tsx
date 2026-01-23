'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';

interface User {
  email: string;
}

interface UserMenuProps {
  user: User;
  isAdmin: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
}

export default function UserMenu({
  user,
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
        className="flex items-center gap-2 px-4 py-2 text-[0.95rem] font-medium text-[#1a1a1a] hover:text-[#0047ba] transition-colors rounded-md hover:bg-[#f0f4f8]"
      >
        <span className="w-8 h-8 bg-[#0a1f5c] text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {user.email.charAt(0).toUpperCase()}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* User Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#e0e4e8] py-2 z-50">
          <div className="px-4 py-2 border-b border-[#e0e4e8]">
            <p className="text-sm text-[#5c6670]">Signed in as</p>
            <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
            onClick={onClose}
          >
            Profile
          </Link>
          <Link
            href="/dashboard/tickets"
            className="block px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
            onClick={onClose}
          >
            My Tickets
          </Link>
          {isAdmin && (
            <>
              <div className="border-t border-[#e0e4e8] my-2" />
              <Link
                href="/admin/invoices"
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f4f8] transition-colors"
                onClick={onClose}
              >
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">Admin</span>
                Admin Panel
              </Link>
            </>
          )}
          <div className="border-t border-[#e0e4e8] my-2" />
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
