'use client';

import { useState, useTransition } from 'react';
import { adminCancelOrder } from '@/lib/admin-actions';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Consistent date formatting to avoid hydration mismatches
function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  });
}

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

interface Order {
  id: string;
  purchaserEmail: string;
  purchaserName: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  createdAt: Date;
  invoiceNumber: string | null;
  orgName: string | null;
  stripePaymentId?: string | null;
  registrations: {
    id: string;
    name: string;
    email: string;
    ticketType: string;
    status: string;
  }[];
  coupon: { code: string } | null;
}

interface OrderListProps {
  orders: Order[];
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled' | 'failed';
type MethodFilter = 'all' | 'card' | 'invoice';

export default function OrderList({ orders }: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [search, setSearch] = useState('');
  const [localOrders, setLocalOrders] = useState(orders);
  const [isPending, startTransition] = useTransition();
  const [cancelDialog, setCancelDialog] = useState<{
    orderId: string;
    canRefund: boolean;
    order: Order;
  } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCancelOrder = (withRefund: boolean) => {
    if (!cancelDialog) return;
    startTransition(async () => {
      const result = await adminCancelOrder(cancelDialog.orderId, { issueRefund: withRefund });
      if (result.success) {
        setLocalOrders((prev) =>
          prev.map((o) =>
            o.id === cancelDialog.orderId
              ? {
                  ...o,
                  paymentStatus: 'cancelled',
                  registrations: o.registrations.map((r) => ({
                    ...r,
                    status: withRefund && result.refundId ? 'refunded' : 'cancelled',
                  })),
                }
              : o
          )
        );
        setCancelDialog(null);
      } else {
        alert(result.error || 'Failed to cancel order');
      }
    });
  };

  const filteredOrders = localOrders.filter((order) => {
    if (statusFilter !== 'all' && order.paymentStatus !== statusFilter) return false;
    if (methodFilter !== 'all' && order.paymentMethod !== methodFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        order.purchaserEmail.toLowerCase().includes(searchLower) ||
        order.purchaserName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.invoiceNumber?.toLowerCase().includes(searchLower) ||
        order.registrations.some(
          (r) =>
            r.name.toLowerCase().includes(searchLower) ||
            r.email.toLowerCase().includes(searchLower)
        )
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
      case 'failed':
        return 'bg-gray-100 text-gray-800';
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
          placeholder="Search orders..."
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
          <option value="failed">Failed</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
          className="px-3 py-2 border border-[--border] rounded text-sm"
        >
          <option value="all">All Methods</option>
          <option value="card">Card</option>
          <option value="invoice">Invoice</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-[--bg-light] text-sm text-[--text-muted] border-b border-[--border]">
        Showing {filteredOrders.length} of {localOrders.length} orders
      </div>

      {/* Order List */}
      <div className="divide-y divide-[--border]">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-[--text-muted]">No orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[--navy]">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[--bg-light] text-[--text-muted]">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-sm text-[--text-muted] mt-1">
                    {order.purchaserName} ({order.purchaserEmail})
                    {order.orgName && <span className="ml-1">• {order.orgName}</span>}
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    {formatDateTime(order.createdAt)}
                    {order.invoiceNumber && <span className="ml-2">• Invoice: {order.invoiceNumber}</span>}
                    {order.coupon && <span className="ml-2">• Coupon: {order.coupon.code}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[--navy]">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </p>
                  {order.discountAmount > 0 && (
                    <p className="text-xs text-green-600">
                      -${(order.discountAmount / 100).toFixed(2)} discount
                    </p>
                  )}
                  <p className="text-xs text-[--text-muted]">
                    {order.registrations.length} ticket(s)
                  </p>
                </div>
              </div>
              {/* Expandable Registrations */}
              <div className="mt-2">
                <button
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="text-xs text-[--blue] hover:underline"
                >
                  {expandedId === order.id ? 'Hide' : 'Show'} {order.registrations.length} ticket(s)
                </button>
                {expandedId === order.id && (
                  <div className="bg-[--bg-light] rounded p-2 space-y-1 mt-2">
                    {order.registrations.map((reg) => (
                      <div key={reg.id} className="flex justify-between text-sm">
                        <span>
                          {reg.name} <span className="text-[--text-muted]">({reg.email})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[--text-muted]">{reg.ticketType}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadge(reg.status)}`}>
                            {reg.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              {order.paymentStatus !== 'cancelled' && (
                <div className="mt-3 pt-3 border-t border-[--border] flex gap-2">
                  <button
                    onClick={() =>
                      setCancelDialog({
                        orderId: order.id,
                        canRefund:
                          order.paymentMethod === 'card' &&
                          order.paymentStatus === 'paid' &&
                          order.totalAmount > 0,
                        order,
                      })
                    }
                    disabled={isPending}
                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cancel Order Dialog */}
      {cancelDialog && (() => {
        const order = cancelDialog.order;
        const refundAmount = (order.totalAmount / 100).toFixed(2);
        const orderIsPending = order.paymentStatus === 'pending';
        const orderIsPaid = order.paymentStatus === 'paid';
        const isCardPayment = order.paymentMethod === 'card';
        const isInvoicePayment = order.paymentMethod === 'invoice';
        const isFreeOrder = order.totalAmount === 0;

        return (
          <ConfirmationDialog
            isOpen={!!cancelDialog}
            onClose={() => setCancelDialog(null)}
            onConfirm={() => handleCancelOrder(false)}
            title="Cancel Order"
            message={
              <div className="space-y-4">
                <p className="text-[--text-body]">
                  Are you sure you want to cancel this order? This will cancel{' '}
                  <strong>{order.registrations.length} ticket{order.registrations.length > 1 ? 's' : ''}</strong>.
                </p>

                {/* Order details */}
                <div className="bg-[--bg-light] p-3 rounded-lg text-sm space-y-1">
                  <p><span className="text-[--text-muted]">Order ID:</span> <strong>#{order.id.slice(-8).toUpperCase()}</strong></p>
                  <p><span className="text-[--text-muted]">Purchaser:</span> {order.purchaserName} ({order.purchaserEmail})</p>
                  <p><span className="text-[--text-muted]">Tickets:</span> {order.registrations.length}</p>
                  {order.totalAmount > 0 && (
                    <p><span className="text-[--text-muted]">Total paid:</span> ${refundAmount} AUD</p>
                  )}
                  <p><span className="text-[--text-muted]">Payment method:</span> {isCardPayment ? 'Credit/Debit Card' : 'Invoice'}</p>
                  <p><span className="text-[--text-muted]">Status:</span> {order.paymentStatus}</p>
                </div>

                {/* Refund status messaging */}
                {orderIsPending ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800">No payment received</p>
                        <p className="text-sm text-blue-700">
                          This order has not been paid yet. Cancelling will simply mark it as cancelled with no refund needed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isFreeOrder ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800">No refund needed</p>
                        <p className="text-sm text-gray-700">
                          This was a complimentary order. No refund will be issued.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : orderIsPaid && isCardPayment ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-800">Automatic refund available</p>
                        <p className="text-sm text-green-700">
                          You can issue a full refund of <strong>${refundAmount} AUD</strong> to the original payment method via Stripe.
                          The refund typically takes 5-10 business days to process.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : orderIsPaid && isInvoicePayment ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-amber-800">Manual refund required</p>
                        <p className="text-sm text-amber-700">
                          This order was paid by invoice. If a refund of <strong>${refundAmount} AUD</strong> is needed,
                          it must be processed manually (e.g., bank transfer).
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <p className="text-xs text-[--text-muted]">
                  This action cannot be undone. All attendees on this order will lose access to the event.
                </p>
              </div>
            }
            confirmLabel={
              orderIsPending || isFreeOrder
                ? "Cancel order"
                : isInvoicePayment
                  ? "Cancel order (no auto-refund)"
                  : "Cancel without refund"
            }
            cancelLabel="Keep order"
            variant="danger"
            isLoading={isPending}
            extraAction={
              cancelDialog.canRefund
                ? {
                    label: `Cancel & refund $${refundAmount}`,
                    onClick: () => handleCancelOrder(true),
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
