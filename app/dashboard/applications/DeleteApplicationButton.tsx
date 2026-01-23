'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { deleteSpeakerProposal, deleteScholarshipApplication } from '@/lib/application-actions';

interface DeleteApplicationButtonProps {
  id: string;
  type: 'speaker' | 'scholarship';
  title: string;
  status: string;
}

export default function DeleteApplicationButton({
  id,
  type,
  title,
  status,
}: DeleteApplicationButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        type === 'speaker'
          ? await deleteSpeakerProposal(id)
          : await deleteScholarshipApplication(id);

      if (!result.success) {
        setError(result.error || 'Failed to delete application');
        return;
      }

      setShowDialog(false);
      router.refresh();
    } catch {
      setError('Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  // Only show for pending applications
  if (status !== 'pending') {
    return null;
  }

  const typeLabel = type === 'speaker' ? 'speaker proposal' : 'scholarship application';

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed ml-4"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </button>

      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}

      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDelete}
        title={`Delete ${type === 'speaker' ? 'Speaker Proposal' : 'Scholarship Application'}`}
        message={
          <div className="space-y-3">
            <p>
              Are you sure you want to delete this {typeLabel}? This action cannot be undone.
            </p>
            <div className="bg-[--bg-light] p-3 rounded text-sm">
              <p className="font-medium text-[--navy]">{title}</p>
            </div>
          </div>
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}
