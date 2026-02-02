import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getOrCreateCurrentProfile } from '@/lib/auth/profile';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutStart = performance.now();
  // Get or create profile (auto-creates for new signups)
  const profile = await getOrCreateCurrentProfile();
  console.log(`[PERF] DashboardLayout getOrCreateCurrentProfile: ${(performance.now() - layoutStart).toFixed(0)}ms`);

  if (!profile) {
    redirect('/auth/email-otp');
  }

  const userIsAdmin = profile.isAdmin;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Pass profile data to Header to avoid redundant /api/auth/me fetch */}
      <Header
        initialUserEmail={profile.email}
        initialProfile={{ name: profile.name, avatarUrl: profile.avatarUrl }}
        initialIsAdmin={userIsAdmin}
      />
      <DashboardNav isAdmin={userIsAdmin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
