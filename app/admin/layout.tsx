import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getCurrentProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get profile in one call (includes admin check)
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/email-otp');
  }

  if (!profile.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Pass profile data to Header to avoid redundant /api/auth/me fetch */}
      <Header
        initialUserEmail={profile.email}
        initialProfile={{ name: profile.name, avatarUrl: profile.avatarUrl }}
        initialIsAdmin={true}
      />
      <DashboardNav isAdmin={true} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
