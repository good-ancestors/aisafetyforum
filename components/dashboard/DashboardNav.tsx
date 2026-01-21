'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardNavProps {
  isAdmin: boolean;
}

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  // User items
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/tickets', label: 'Tickets' },
  { href: '/dashboard/applications', label: 'Applications' },
  { href: '/dashboard/profile', label: 'Profile' },
  // Admin items
  { href: '/admin/orders', label: 'All Orders', adminOnly: true },
  { href: '/admin/registrations', label: 'All Tickets', adminOnly: true },
  { href: '/admin/applications', label: 'All Applications', adminOnly: true },
  { href: '/admin/profiles', label: 'Users', adminOnly: true },
  { href: '/admin/invoices', label: 'Invoices', adminOnly: true },
  { href: '/admin/discounts', label: 'Discounts', adminOnly: true },
];

export default function DashboardNav({ isAdmin }: DashboardNavProps) {
  const pathname = usePathname();

  const userItems = navItems.filter((item) => !item.adminOnly);
  const adminItems = navItems.filter((item) => item.adminOnly);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-[--border]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* User Navigation */}
          {userItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                isActive(item.href)
                  ? 'text-[--navy] border-[--navy]'
                  : 'text-[--text-muted] border-transparent hover:text-[--navy] hover:border-[--border]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin Section Divider */}
          {isAdmin && (
            <>
              <div className="h-6 w-px bg-[--border] mx-2" />
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                Admin
              </span>
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin &&
            adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isActive(item.href)
                    ? 'text-[--navy] border-[--navy]'
                    : 'text-[--text-muted] border-transparent hover:text-[--navy] hover:border-[--border]'
                }`}
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}
