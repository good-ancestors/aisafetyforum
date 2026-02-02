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
  // Get or create profile (auto-creates for new signups)
  const profile = await getOrCreateCurrentProfile();

  if (!profile) {
    redirect('/auth/email-otp');
  }

  const userIsAdmin = profile.isAdmin;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />
      <DashboardNav isAdmin={userIsAdmin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
