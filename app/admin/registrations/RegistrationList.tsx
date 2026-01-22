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
    registration: Registration;
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
                          registration: reg,
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
      {cancelDialog && (() => {
        const reg = cancelDialog.registration;
        const ticketPrice = reg.amountPaid || reg.ticketPrice || 0;
        const refundAmount = (ticketPrice / 100).toFixed(2);
        const regIsPending = reg.status === 'pending';
        const regIsPaid = reg.status === 'paid';
        const isCardPayment = reg.order?.paymentMethod === 'card';
        const isInvoicePayment = reg.order?.paymentMethod === 'invoice';
        const isFreeTicket = ticketPrice === 0;

        return (
          <ConfirmationDialog
            isOpen={!!cancelDialog}
            onClose={() => setCancelDialog(null)}
            onConfirm={() => handleCancelRegistration(false)}
            title="Cancel Ticket"
            message={
              <div className="space-y-4">
                <p className="text-[--text-body]">
                  Are you sure you want to cancel this ticket?
                </p>

                {/* Ticket details */}
                <div className="bg-[--bg-light] p-3 rounded-lg text-sm space-y-1">
                  <p><span className="text-[--text-muted]">Attendee:</span> <strong>{reg.name}</strong></p>
                  <p><span className="text-[--text-muted]">Email:</span> {reg.email}</p>
                  <p><span className="text-[--text-muted]">Ticket:</span> {reg.ticketType}</p>
                  {ticketPrice > 0 && (
                    <p><span className="text-[--text-muted]">Price paid:</span> ${refundAmount} AUD</p>
                  )}
                  {reg.order && (
                    <>
                      <p><span className="text-[--text-muted]">Payment method:</span> {isCardPayment ? 'Credit/Debit Card' : 'Invoice'}</p>
                      <p><span className="text-[--text-muted]">Order:</span> #{reg.order.id.slice(-8).toUpperCase()}</p>
                    </>
                  )}
                  <p><span className="text-[--text-muted]">Status:</span> {reg.status}</p>
                </div>

                {/* Refund status messaging */}
                {regIsPending ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800">No payment received</p>
                        <p className="text-sm text-blue-700">
                          This ticket has not been paid yet. Cancelling will simply mark it as cancelled with no refund needed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isFreeTicket ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800">No refund needed</p>
                        <p className="text-sm text-gray-700">
                          This is a complimentary ticket. No refund will be issued.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : regIsPaid && isCardPayment ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-800">Automatic refund available</p>
                        <p className="text-sm text-green-700">
                          You can issue a partial refund of <strong>${refundAmount} AUD</strong> to the original payment method via Stripe.
                          The refund typically takes 5-10 business days to process.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : regIsPaid && isInvoicePayment ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-amber-800">Manual refund required</p>
                        <p className="text-sm text-amber-700">
                          This ticket was paid by invoice. If a refund of <strong>${refundAmount} AUD</strong> is needed,
                          it must be processed manually (e.g., bank transfer).
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <p className="text-xs text-[--text-muted]">
                  This action cannot be undone. The attendee will no longer have access to the event.
                </p>
              </div>
            }
            confirmLabel={
              regIsPending || isFreeTicket
                ? "Cancel ticket"
                : isInvoicePayment
                  ? "Cancel ticket (no auto-refund)"
                  : "Cancel without refund"
            }
            cancelLabel="Keep ticket"
            variant="danger"
            isLoading={isPending}
            extraAction={
              cancelDialog.canRefund
                ? {
                    label: `Cancel & refund $${refundAmount}`,
                    onClick: () => handleCancelRegistration(true),
                    variant: 'danger',
                  }
                : undefined
            }
          />
        );
      })()}
    </div>
  );
}
