import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { isAdmin } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/email-otp');
  }

  const userIsAdmin = await isAdmin(user.email);

  return (
    <div className="min-h-screen bg-[--bg-cream] flex flex-col">
      <Header />
      <DashboardNav isAdmin={userIsAdmin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
