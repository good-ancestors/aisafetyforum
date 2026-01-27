'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { cancelRegistration, getRegistrationCancellationInfo } from '@/lib/cancellation-actions';
import { eventConfig } from '@/lib/config';

interface CancelTicketButtonProps {
  registrationId: string;
  ticketType: string;
  attendeeName: string;
  ticketPrice: number;
  status: string;
}

export default function CancelTicketButton({
  registrationId,
  ticketType,
  attendeeName,
  ticketPrice,
  status,
}: CancelTicketButtonProps) {
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
      const info = await getRegistrationCancellationInfo(registrationId);
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
      const result = await cancelRegistration(registrationId, {
        issueRefund: cancellationInfo?.canRefund,
      });

      if (!result.success) {
        setError(result.error || 'Failed to cancel ticket');
        return;
      }

      setShowDialog(false);
      router.refresh();
    } catch {
      setError('Failed to cancel ticket');
    } finally {
      setLoading(false);
    }
  };

  // Only show for paid tickets (pending tickets can be cancelled via order)
  if (status !== 'paid') {
    return null;
  }

  const refundAmount = (ticketPrice / 100).toFixed(2);

  return (
    <>
      <button
        onClick={handleOpenDialog}
        disabled={loading}
        className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Cancel ticket'}
      </button>

      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}

      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Ticket"
        message={
          <div className="space-y-4">
            <p className="text-[--text-body]">
              Are you sure you want to cancel this ticket?
            </p>

            {/* Ticket details */}
            <div className="bg-[--bg-light] p-3 rounded-lg text-sm space-y-1">
              <p><span className="text-[--text-muted]">Attendee:</span> <strong>{attendeeName}</strong></p>
              <p><span className="text-[--text-muted]">Ticket:</span> {ticketType}</p>
              {ticketPrice > 0 && (
                <p><span className="text-[--text-muted]">Price paid:</span> ${refundAmount} AUD</p>
              )}
            </div>

            {/* Refund status - very clear messaging */}
            {cancellationInfo?.canRefund ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-green-800">Automatic refund</p>
                    <p className="text-sm text-green-700">
                      <strong>${refundAmount} AUD</strong> will be refunded to your original payment method (card ending in ****). This typically takes 5-10 business days.
                    </p>
                  </div>
                </div>
              </div>
            ) : cancellationInfo?.paymentMethod === 'invoice' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800">Manual refund required</p>
                    <p className="text-sm text-amber-700">
                      This ticket was paid by invoice. After cancellation, please contact us at <a href={`mailto:${eventConfig.organization.email}`} className="underline">{eventConfig.organization.email}</a> to arrange a refund of <strong>${refundAmount} AUD</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : ticketPrice === 0 ? (
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

            <p className="text-xs text-[--text-muted]">
              This action cannot be undone. The attendee will no longer have access to the event.
            </p>
          </div>
        }
        confirmLabel={cancellationInfo?.canRefund ? "Cancel & refund ticket" : "Cancel ticket"}
        cancelLabel="Keep ticket"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
