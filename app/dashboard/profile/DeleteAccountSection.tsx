'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { authClient } from '@/lib/auth/client';
import { deleteProfile, getProfileDeletionInfo } from '@/lib/profile-actions';

export default function DeleteAccountSection() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingInfo, setCheckingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionInfo, setDeletionInfo] = useState<{
    canDelete: boolean;
    hasPendingOrders: boolean;
    paidOrderCount: number;
    pendingApplicationCount: number;
    decidedApplicationCount: number;
  } | null>(null);

  const handleOpenDialog = async () => {
    setCheckingInfo(true);
    setError(null);

    try {
      const info = await getProfileDeletionInfo();
      if (info.error) {
        setError(info.error);
        return;
      }
      setDeletionInfo(info);
      setShowDialog(true);
    } catch {
      setError('Failed to check account status');
    } finally {
      setCheckingInfo(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteProfile();

      if (!result.success) {
        setError(result.error || 'Failed to delete account');
        return;
      }

      // Sign out the user after successful deletion
      await authClient.signOut();
      router.push('/');
    } catch {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const totalApplications =
    (deletionInfo?.pendingApplicationCount || 0) + (deletionInfo?.decidedApplicationCount || 0);

  return (
    <section className="bg-white rounded-lg border border-red-200 p-6">
      <h2 className="font-serif text-xl font-bold text-red-700 mb-2">
        Delete Account
      </h2>
      <p className="text-sm text-[--text-muted] mb-4">
        Permanently delete your account and all associated data.
      </p>

      <div className="bg-red-50 border border-red-100 rounded p-4 mb-4">
        <p className="text-sm text-red-800">
          <strong>Warning:</strong> This action is irreversible. Deleting your account will:
        </p>
        <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
          <li>Delete your profile information</li>
          <li>Delete all your speaker proposals and scholarship applications</li>
          <li>Remove your access to ticket information (tickets remain valid for attendees)</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleOpenDialog}
        disabled={checkingInfo}
        className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {checkingInfo && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        Delete My Account
      </button>

      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={deletionInfo?.hasPendingOrders ? () => setShowDialog(false) : handleDelete}
        title="Delete Account"
        message={
          <div className="space-y-4">
            {deletionInfo?.hasPendingOrders ? (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                <p className="text-amber-800 font-medium">Cannot delete account</p>
                <p className="text-sm text-amber-700 mt-1">
                  You have pending orders that must be cancelled first. Please go to
                  the Tickets page to cancel any pending orders before deleting your
                  account.
                </p>
              </div>
            ) : (
              <>
                <p>
                  Are you sure you want to permanently delete your account? This
                  action cannot be undone.
                </p>

                <div className="bg-[--bg-light] p-3 rounded text-sm space-y-2">
                  <p className="font-medium text-[--navy]">What will be deleted:</p>
                  <ul className="list-disc ml-4 text-[--text-body] space-y-1">
                    <li>Your profile information</li>
                    {totalApplications > 0 && (
                      <li>
                        {totalApplications} application{totalApplications > 1 ? 's' : ''}{' '}
                        ({deletionInfo?.pendingApplicationCount || 0} pending,{' '}
                        {deletionInfo?.decidedApplicationCount || 0} decided)
                      </li>
                    )}
                  </ul>

                  {(deletionInfo?.paidOrderCount || 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-[--border]">
                      <p className="font-medium text-[--navy]">What will be kept:</p>
                      <ul className="list-disc ml-4 text-[--text-body] space-y-1">
                        <li>
                          {deletionInfo?.paidOrderCount} paid order
                          {(deletionInfo?.paidOrderCount || 0) > 1 ? 's' : ''} (for
                          record-keeping, unlinked from your account)
                        </li>
                        <li>Ticket registrations remain valid for event attendance</li>
                      </ul>
                    </div>
                  )}
                </div>

                <p className="text-sm text-[--text-muted]">
                  You will be signed out immediately after deletion.
                </p>
              </>
            )}
          </div>
        }
        confirmLabel={deletionInfo?.hasPendingOrders ? 'Close' : 'Delete Account'}
        cancelLabel={deletionInfo?.hasPendingOrders ? undefined : 'Cancel'}
        variant="danger"
        isLoading={loading}
      />
    </section>
  );
}
