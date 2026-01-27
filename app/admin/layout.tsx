import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getCurrentProfile } from '@/lib/auth/profile';

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
    <div className="min-h-screen bg-[--bg-cream] flex flex-col">
      <Header />
      <DashboardNav isAdmin={true} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
