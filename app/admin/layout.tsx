import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardNav from '@/components/dashboard/DashboardNav';

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
