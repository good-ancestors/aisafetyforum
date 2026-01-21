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
  const [cancelDialog, setCancelDialog] = useState<{ orderId: string; canRefund: boolean } | null>(null);
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
      {cancelDialog && (
        <ConfirmationDialog
          isOpen={!!cancelDialog}
          onClose={() => setCancelDialog(null)}
          onConfirm={() => handleCancelOrder(false)}
          title="Cancel Order"
          message={
            cancelDialog.canRefund
              ? 'Do you want to cancel this order? You can choose to issue a refund.'
              : 'Are you sure you want to cancel this order? This will mark all tickets as cancelled.'
          }
          confirmLabel="Cancel Only"
          variant="danger"
          isLoading={isPending}
          extraAction={
            cancelDialog.canRefund
              ? {
                  label: 'Cancel & Refund',
                  onClick: () => handleCancelOrder(true),
                  variant: 'danger',
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
