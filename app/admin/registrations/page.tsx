import { getAllRegistrations, getRegistrationStats } from '@/lib/admin-actions';
import RegistrationList from './RegistrationList';

export default async function AdminRegistrationsPage() {
  const [registrations, stats] = await Promise.all([
    getAllRegistrations(),
    getRegistrationStats(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-2">
        All Tickets
      </h1>
      <p className="text-muted mb-8">
        Manage all event registrations and tickets.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Total</p>
          <p className="text-2xl font-bold text-navy">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Paid</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Refunded</p>
          <p className="text-2xl font-bold text-gray-600">{stats.refunded}</p>
        </div>
      </div>

      {/* Ticket Type Breakdown */}
      {stats.ticketTypes.length > 0 && (
        <div className="bg-white rounded-lg border border-border p-4 mb-8">
          <h2 className="font-semibold text-navy mb-3">Ticket Types (Paid)</h2>
          <div className="flex flex-wrap gap-4">
            {stats.ticketTypes.map((tt) => (
              <div key={tt.type} className="bg-light px-3 py-2 rounded">
                <span className="text-muted text-sm">{tt.type}:</span>
                <span className="ml-2 font-semibold">{tt.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration List */}
      <RegistrationList
        registrations={registrations.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          ticketType: r.ticketType,
          status: r.status,
          ticketPrice: r.ticketPrice,
          amountPaid: r.amountPaid,
          discountAmount: r.discountAmount,
          createdAt: r.createdAt,
          profile: r.profile
            ? {
                id: r.profile.id,
                name: r.profile.name,
                organisation: r.profile.organisation,
              }
            : null,
          order: r.order
            ? {
                id: r.order.id,
                paymentMethod: r.order.paymentMethod,
                paymentStatus: r.order.paymentStatus,
                purchaserEmail: r.order.purchaserEmail,
              }
            : null,
          coupon: r.coupon ? { code: r.coupon.code } : null,
        }))}
      />
    </main>
  );
}
