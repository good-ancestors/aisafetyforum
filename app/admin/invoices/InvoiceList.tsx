'use client';

import { useState } from 'react';
import { markInvoiceAsPaid, resendInvoiceEmail } from '@/lib/admin-actions';

type Order = {
  id: string;
  purchaserEmail: string;
  purchaserName: string;
  orgName: string | null;
  orgABN: string | null;
  poNumber: string | null;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  invoiceNumber: string | null;
  invoiceDueDate: Date | null;
  createdAt: Date;
  registrations: {
    id: string;
    name: string;
    email: string;
    ticketType: string;
  }[];
};

export default function InvoiceList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.paymentStatus === filter;
  });

  async function handleMarkAsPaid(orderId: string) {
    if (!confirm('Are you sure you want to mark this invoice as paid? This will send confirmation emails to all attendees.')) {
      return;
    }

    setLoading(orderId);
    setMessage(null);

    const result = await markInvoiceAsPaid(orderId);

    if (result.success) {
      setMessage({ type: 'success', text: 'Invoice marked as paid. Confirmation emails sent.' });
      // Reload page to refresh data
      window.location.reload();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to mark as paid' });
    }

    setLoading(null);
  }

  async function handleResendInvoice(orderId: string) {
    setLoading(orderId);
    setMessage(null);

    const result = await resendInvoiceEmail(orderId);

    if (result.success) {
      setMessage({ type: 'success', text: 'Invoice email resent successfully.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to resend invoice' });
    }

    setLoading(null);
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function isOverdue(dueDate: Date | null) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'paid', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#0a1f5c] text-white'
                : 'bg-white text-[#5c6670] hover:bg-[#f0f4f8] border border-[#e0e4e8]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                {orders.filter((o) => o.paymentStatus === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border-l-4 border-green-500 text-green-700'
              : 'bg-red-50 border-l-4 border-red-500 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e0e4e8] p-8 text-center text-[#5c6670]">
            No {filter === 'all' ? '' : filter} invoices found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-lg border ${
                order.paymentStatus === 'paid'
                  ? 'border-green-200'
                  : isOverdue(order.invoiceDueDate)
                    ? 'border-red-300'
                    : 'border-[#e0e4e8]'
              } overflow-hidden`}
            >
              {/* Order Header */}
              <div className="p-4 border-b border-[#e0e4e8] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-mono font-bold text-[#0a1f5c]">
                      {order.invoiceNumber || `AISF-${order.id.slice(-8).toUpperCase()}`}
                    </span>
                    <span
                      className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : isOverdue(order.invoiceDueDate)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.paymentStatus === 'paid'
                        ? 'PAID'
                        : isOverdue(order.invoiceDueDate)
                          ? 'OVERDUE'
                          : 'PENDING'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#0a1f5c]">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </span>
                  <span className="text-[#5c6670] ml-1">AUD</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[#5c6670] block">Purchaser</span>
                  <span className="font-medium">{order.purchaserName}</span>
                  <span className="text-[#5c6670] block">{order.purchaserEmail}</span>
                  {order.orgName && <span className="text-[#5c6670] block">{order.orgName}</span>}
                </div>
                <div>
                  <span className="text-[#5c6670] block">Created</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                  {order.invoiceDueDate && (
                    <>
                      <span className="text-[#5c6670] block mt-1">Due</span>
                      <span
                        className={`font-medium ${
                          isOverdue(order.invoiceDueDate) && order.paymentStatus !== 'paid'
                            ? 'text-red-600'
                            : ''
                        }`}
                      >
                        {formatDate(order.invoiceDueDate)}
                      </span>
                    </>
                  )}
                </div>
                <div>
                  <span className="text-[#5c6670] block">Attendees ({order.registrations.length})</span>
                  {order.registrations.slice(0, 3).map((reg) => (
                    <span key={reg.id} className="block text-xs">
                      {reg.name} - {reg.ticketType}
                    </span>
                  ))}
                  {order.registrations.length > 3 && (
                    <span className="text-[#5c6670] text-xs">
                      +{order.registrations.length - 3} more
                    </span>
                  )}
                </div>
                <div>
                  {order.poNumber && (
                    <>
                      <span className="text-[#5c6670] block">PO Number</span>
                      <span className="font-medium">{order.poNumber}</span>
                    </>
                  )}
                  {order.discountAmount > 0 && (
                    <>
                      <span className="text-[#5c6670] block mt-1">Discount</span>
                      <span className="font-medium text-green-600">
                        -${(order.discountAmount / 100).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-[#f9fafb] border-t border-[#e0e4e8] flex gap-3">
                {order.paymentStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleMarkAsPaid(order.id)}
                      disabled={loading === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading === order.id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                    <button
                      onClick={() => handleResendInvoice(order.id)}
                      disabled={loading === order.id}
                      className="px-4 py-2 bg-[#0a1f5c] text-white rounded-md text-sm font-medium hover:bg-[#1a3a8f] transition-colors disabled:opacity-50"
                    >
                      Resend Invoice
                    </button>
                  </>
                )}
                <a
                  href={`/api/orders/${order.id}/invoice/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View Invoice
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
