'use client';

import { useState, useTransition } from 'react';
import { adminCancelRegistration } from '@/lib/admin-actions';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Consistent date formatting to avoid hydration mismatches
function formatDateTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
  });
}

interface Registration {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  status: string;
  ticketPrice: number | null;
  amountPaid: number | null;
  discountAmount: number | null;
  createdAt: Date;
  profile: {
    id: string;
    name: string | null;
    organisation: string | null;
  } | null;
  order: {
    id: string;
    paymentMethod: string;
    paymentStatus: string;
    purchaserEmail: string;
  } | null;
  coupon: { code: string } | null;
}

interface RegistrationListProps {
  registrations: Registration[];
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled' | 'refunded';
type TicketFilter = 'all' | string;

export default function RegistrationList({ registrations }: RegistrationListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('all');
  const [search, setSearch] = useState('');
  const [localRegistrations, setLocalRegistrations] = useState(registrations);
  const [isPending, startTransition] = useTransition();
  const [cancelDialog, setCancelDialog] = useState<{
    regId: string;
    canRefund: boolean;
    name: string;
  } | null>(null);

  const handleCancelRegistration = (withRefund: boolean) => {
    if (!cancelDialog) return;
    startTransition(async () => {
      const result = await adminCancelRegistration(cancelDialog.regId, { issueRefund: withRefund });
      if (result.success) {
        setLocalRegistrations((prev) =>
          prev.map((r) =>
            r.id === cancelDialog.regId
              ? { ...r, status: withRefund && result.refundId ? 'refunded' : 'cancelled' }
              : r
          )
        );
        setCancelDialog(null);
      } else {
        alert(result.error || 'Failed to cancel ticket');
      }
    });
  };

  // Get unique ticket types
  const ticketTypes = Array.from(new Set(localRegistrations.map((r) => r.ticketType))).sort();

  const filteredRegistrations = localRegistrations.filter((reg) => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
    if (ticketFilter !== 'all' && reg.ticketType !== ticketFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        reg.name.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        reg.id.toLowerCase().includes(searchLower) ||
        reg.profile?.organisation?.toLowerCase().includes(searchLower) ||
        reg.order?.purchaserEmail.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[--border]">
      {/* Filters */}
      <div className="p-4 border-b border-[--border] flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search registrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[--border] rounded text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 border border-[--border] rounded text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={ticketFilter}
          onChange={(e) => setTicketFilter(e.target.value)}
          className="px-3 py-2 border border-[--border] rounded text-sm"
        >
          <option value="all">All Ticket Types</option>
          {ticketTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-[--bg-light] text-sm text-[--text-muted] border-b border-[--border]">
        Showing {filteredRegistrations.length} of {localRegistrations.length} registrations
      </div>

      {/* Registration List */}
      <div className="divide-y divide-[--border]">
        {filteredRegistrations.length === 0 ? (
          <div className="p-8 text-center text-[--text-muted]">No registrations found</div>
        ) : (
          filteredRegistrations.map((reg) => (
            <div key={reg.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[--navy]">{reg.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(reg.status)}`}>
                      {reg.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[--bg-light] text-[--text-muted]">
                      {reg.ticketType}
                    </span>
                  </div>
                  <p className="text-sm text-[--text-muted] mt-1">
                    {reg.email}
                    {reg.profile?.organisation && (
                      <span className="ml-2">• {reg.profile.organisation}</span>
                    )}
                  </p>
                  <p className="text-xs text-[--text-muted] mt-1">
                    {formatDateTime(reg.createdAt)}
                    {reg.order && (
                      <span className="ml-2">
                        • Order: #{reg.order.id.slice(-8).toUpperCase()} ({reg.order.paymentMethod})
                      </span>
                    )}
                    {reg.coupon && <span className="ml-2">• Coupon: {reg.coupon.code}</span>}
                  </p>
                </div>
                <div className="text-right ml-4 flex flex-col items-end gap-2">
                  <div>
                    <p className="font-semibold text-[--navy]">
                      ${((reg.amountPaid || reg.ticketPrice || 0) / 100).toFixed(2)}
                    </p>
                    {reg.discountAmount && reg.discountAmount > 0 && (
                      <p className="text-xs text-green-600">
                        -${(reg.discountAmount / 100).toFixed(2)} discount
                      </p>
                    )}
                    <p className="text-xs text-[--text-muted]">
                      #{reg.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  {reg.status !== 'cancelled' && reg.status !== 'refunded' && (
                    <button
                      onClick={() =>
                        setCancelDialog({
                          regId: reg.id,
                          canRefund:
                            reg.order?.paymentMethod === 'card' &&
                            reg.status === 'paid' &&
                            (reg.amountPaid || 0) > 0,
                          name: reg.name,
                        })
                      }
                      disabled={isPending}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel Registration Dialog */}
      {cancelDialog && (
        <ConfirmationDialog
          isOpen={!!cancelDialog}
          onClose={() => setCancelDialog(null)}
          onConfirm={() => handleCancelRegistration(false)}
          title="Cancel Ticket"
          message={
            cancelDialog.canRefund
              ? `Cancel the ticket for ${cancelDialog.name}? You can choose to issue a refund.`
              : `Cancel the ticket for ${cancelDialog.name}?`
          }
          confirmLabel="Cancel Only"
          variant="danger"
          isLoading={isPending}
          extraAction={
            cancelDialog.canRefund
              ? {
                  label: 'Cancel & Refund',
                  onClick: () => handleCancelRegistration(true),
                  variant: 'danger',
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
