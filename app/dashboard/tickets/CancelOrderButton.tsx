'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { cancelOrder, getOrderCancellationInfo } from '@/lib/cancellation-actions';

interface CancelOrderButtonProps {
  orderId: string;
  ticketCount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

export default function CancelOrderButton({
  orderId,
  ticketCount,
  totalAmount,
  paymentMethod,
  paymentStatus,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationInfo, setCancellationInfo] = useState<{
    canRefund: boolean;
    refundMessage?: string;
    paymentMethod: string;
  } | null>(null);

  const handleOpenDialog = async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await getOrderCancellationInfo(orderId);
      setCancellationInfo({
        canRefund: info.canRefund,
        refundMessage: info.refundMessage,
        paymentMethod: info.paymentMethod,
      });
      setShowDialog(true);
    } catch {
      setError('Failed to check cancellation options');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelOrder(orderId, {
        issueRefund: cancellationInfo?.canRefund,
      });

      if (!result.success) {
        setError(result.error || 'Failed to cancel order');
        return;
      }

      setShowDialog(false);
      router.refresh();
    } catch {
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  // Don't show for already cancelled orders
  if (paymentStatus === 'cancelled') {
    return null;
  }

  const refundAmount = (totalAmount / 100).toFixed(2);
  const isPending = paymentStatus === 'pending';
  const isPaid = paymentStatus === 'paid';

  return (
    <>
      <button
        onClick={handleOpenDialog}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel order
          </>
        )}
      </button>

      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}

      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={
          <div className="space-y-4">
            <p className="text-body">
              Are you sure you want to cancel this order? This will cancel{' '}
              <strong>{ticketCount} ticket{ticketCount > 1 ? 's' : ''}</strong>.
            </p>

            {/* Order details */}
            <div className="bg-light p-3 rounded-lg text-sm space-y-1">
              <p><span className="text-muted">Tickets:</span> {ticketCount}</p>
              {totalAmount > 0 && (
                <p><span className="text-muted">Total paid:</span> ${refundAmount} AUD</p>
              )}
              <p><span className="text-muted">Payment method:</span> {paymentMethod === 'card' ? 'Credit/Debit Card' : 'Invoice'}</p>
              <p><span className="text-muted">Status:</span> {paymentStatus}</p>
            </div>

            {/* Refund status - very clear messaging */}
            {isPending ? (
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
            ) : cancellationInfo?.canRefund ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">Full refund will be issued</p>
                    <p className="text-sm text-green-700">
                      <strong>${refundAmount} AUD</strong> will be refunded to your original payment method. This typically takes 5-10 business days.
                    </p>
                  </div>
                </div>
              </div>
            ) : isPaid && paymentMethod === 'invoice' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800">Manual refund required</p>
                    <p className="text-sm text-amber-700">
                      This order was paid by invoice. After cancellation, please <a href="/contact" className="underline">contact us</a> to arrange a refund of <strong>${refundAmount} AUD</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : totalAmount === 0 ? (
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
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800">Refund unavailable</p>
                    <p className="text-sm text-amber-700">
                      {cancellationInfo?.refundMessage || 'Unable to process automatic refund. Please contact us for assistance.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted">
              This action cannot be undone. All attendees on this order will lose access to the event.
            </p>
          </div>
        }
        confirmLabel={
          isPending
            ? "Cancel order"
            : cancellationInfo?.canRefund
              ? "Cancel & refund order"
              : "Cancel order"
        }
        cancelLabel="Keep order"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
