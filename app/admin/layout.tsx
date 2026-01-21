import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[--bg-cream]">
      {/* Admin Navigation Bar */}
      <nav className="bg-[--navy-dark] text-white py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/70 hover:text-white text-sm">
              &larr; Dashboard
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-sm font-medium flex items-center gap-2">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                Admin
              </span>
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/invoices"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Invoices
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
