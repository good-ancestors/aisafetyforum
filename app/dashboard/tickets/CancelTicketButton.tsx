'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { cancelRegistration, getRegistrationCancellationInfo } from '@/lib/cancellation-actions';

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
  } | null>(null);

  const handleOpenDialog = async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await getRegistrationCancellationInfo(registrationId);
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
      const result = await cancelRegistration(registrationId, {
        issueRefund: cancellationInfo?.canRefund,
      });

      if (!result.success) {
        setError(result.error || 'Failed to cancel ticket');
        return;
      }

      setShowDialog(false);
      router.refresh();
    } catch (err) {
      setError('Failed to cancel ticket');
    } finally {
      setLoading(false);
    }
  };

  // Only show for paid tickets (pending tickets can be cancelled via order)
  if (status !== 'paid') {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpenDialog}
        disabled={loading}
        className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Cancel'}
      </button>

      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}

      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Ticket"
        message={
          <div className="space-y-3">
            <p>
              Are you sure you want to cancel this ticket?
            </p>
            <div className="bg-[--bg-light] p-3 rounded text-sm">
              <p><strong>Attendee:</strong> {attendeeName}</p>
              <p><strong>Ticket:</strong> {ticketType}</p>
              {ticketPrice > 0 && (
                <p><strong>Price:</strong> ${(ticketPrice / 100).toFixed(2)} AUD</p>
              )}
            </div>
            {cancellationInfo?.canRefund && (
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                A refund of ${(ticketPrice / 100).toFixed(2)} will be processed to the original payment method.
              </p>
            )}
            {cancellationInfo?.refundMessage && (
              <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                {cancellationInfo.refundMessage}
              </p>
            )}
          </div>
        }
        confirmLabel="Cancel Ticket"
        cancelLabel="Keep Ticket"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
