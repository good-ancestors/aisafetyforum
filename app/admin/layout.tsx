import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { requireAdmin } from '@/lib/auth/admin';

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
