import { getAllOrders, getOrderStats } from '@/lib/admin-actions';
import OrderList from './OrderList';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const [orders, stats] = await Promise.all([getAllOrders(), getOrderStats()]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        All Orders
      </h1>
      <p className="text-[--text-muted] mb-8">
        Manage all event orders and payments.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Total Orders</p>
          <p className="text-2xl font-bold text-[--navy]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Paid</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Card Revenue</p>
          <p className="text-xl font-bold text-[--navy]">
            ${(stats.cardRevenue / 100).toLocaleString()} AUD
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Invoice Revenue</p>
          <p className="text-xl font-bold text-[--navy]">
            ${(stats.invoiceRevenue / 100).toLocaleString()} AUD
          </p>
        </div>
      </div>

      <OrderList orders={orders} />
    </main>
  );
}
