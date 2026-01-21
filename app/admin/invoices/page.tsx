import { getInvoiceOrders } from '@/lib/admin-actions';
import { eventConfig } from '@/lib/config';
import InvoiceList from './InvoiceList';

export const dynamic = 'force-dynamic';

export default async function AdminInvoicesPage() {
  const orders = await getInvoiceOrders('all');

  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

  const pendingTotal = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidTotal = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-[#0a1f5c] text-white py-6 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Invoice Management</h1>
          <p className="text-white/70 mt-1">Australian AI Safety Forum {eventConfig.year}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[#e0e4e8] p-6">
            <h3 className="text-sm text-[#5c6670] mb-1">Total Invoices</h3>
            <p className="text-3xl font-bold text-[#0a1f5c]">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-yellow-500 border-y border-r border-[#e0e4e8] p-6">
            <h3 className="text-sm text-[#5c6670] mb-1">Pending Payment</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
            <p className="text-sm text-[#5c6670] mt-1">${(pendingTotal / 100).toLocaleString()} AUD</p>
          </div>
          <div className="bg-white rounded-lg border-l-4 border-green-500 border-y border-r border-[#e0e4e8] p-6">
            <h3 className="text-sm text-[#5c6670] mb-1">Paid</h3>
            <p className="text-3xl font-bold text-green-600">{paidOrders.length}</p>
            <p className="text-sm text-[#5c6670] mt-1">${(paidTotal / 100).toLocaleString()} AUD</p>
          </div>
        </div>

        {/* Invoice List */}
        <InvoiceList orders={orders} />
      </main>
    </div>
  );
}
