import { getInvoiceOrders } from '@/lib/admin-actions';
import InvoiceList from './InvoiceList';

export const dynamic = 'force-dynamic';

export default async function AdminInvoicesPage() {
  const orders = await getInvoiceOrders('all');

  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

  const pendingTotal = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidTotal = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Invoices
      </h1>
      <p className="text-[--text-muted] mb-8">
        Manage invoice orders and payments.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Total Invoices</p>
          <p className="text-2xl font-bold text-[--navy]">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Pending Payment</p>
          <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
          <p className="text-xs text-[--text-muted] mt-1">${(pendingTotal / 100).toLocaleString()} AUD</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidOrders.length}</p>
          <p className="text-xs text-[--text-muted] mt-1">${(paidTotal / 100).toLocaleString()} AUD</p>
        </div>
      </div>

      {/* Invoice List */}
      <InvoiceList orders={orders} />
    </main>
  );
}
