'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  } | null>(null);

  const handleOpenDialog = async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await getOrderCancellationInfo(orderId);
      setCancellationInfo({
        canRefund: info.canRefund,
        refundMessage: info.refundMessage,
      });
      setShowDialog(true);
    } catch (err) {
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
    } catch (err) {
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  // Only show for pending orders (paid orders can be refunded but need different flow)
  if (paymentStatus !== 'pending') {
    return null;
  }

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
            Cancel Order
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
          <div className="space-y-3">
            <p>
              Are you sure you want to cancel this order? This will cancel{' '}
              <strong>{ticketCount} ticket{ticketCount > 1 ? 's' : ''}</strong>.
            </p>
            {totalAmount > 0 && (
              <p className="text-sm text-[--text-muted]">
                Order total: ${(totalAmount / 100).toFixed(2)} AUD
              </p>
            )}
            {cancellationInfo?.refundMessage && (
              <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                {cancellationInfo.refundMessage}
              </p>
            )}
          </div>
        }
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
