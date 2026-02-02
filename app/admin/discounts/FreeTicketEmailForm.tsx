'use client';

import { useState, useTransition } from 'react';
import { addFreeTicketEmail, addBulkFreeTicketEmails } from '@/lib/admin-actions';

interface FreeTicketEmailFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function FreeTicketEmailForm({
  onClose,
  onSuccess,
  onError,
}: FreeTicketEmailFormProps) {
  const [bulkMode, setBulkMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newReason) return;

    startTransition(async () => {
      const result = await addFreeTicketEmail(newEmail, newReason);
      if (result.success) {
        onSuccess('Email added successfully');
        onClose();
        window.location.reload();
      } else {
        onError(result.error || 'Failed to add email');
      }
    });
  };

  const handleAddBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEmails || !newReason) return;

    const emailList = bulkEmails
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (emailList.length === 0) {
      onError('No valid emails found');
      return;
    }

    startTransition(async () => {
      const result = await addBulkFreeTicketEmails(emailList, newReason);
      if (result.success) {
        onSuccess(
          `Added ${result.added} email(s)${result.failed > 0 ? `, ${result.failed} failed (may already exist)` : ''}`
        );
        onClose();
        window.location.reload();
      } else {
        onError(result.error || 'Failed to add emails');
      }
    });
  };

  return (
    <div className="p-4 border-b border-border bg-light">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setBulkMode(false)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            !bulkMode
              ? 'bg-navy text-white border-navy'
              : 'bg-white text-body border hover:border-navy'
          }`}
        >
          Single Email
        </button>
        <button
          type="button"
          onClick={() => setBulkMode(true)}
          className={`px-3 py-1 text-sm rounded border transition-colors ${
            bulkMode
              ? 'bg-navy text-white border-navy'
              : 'bg-white text-body border hover:border-navy'
          }`}
        >
          Bulk Add
        </button>
      </div>

      <form onSubmit={bulkMode ? handleAddBulk : handleAddSingle}>
        {bulkMode ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-body mb-1">
              Email Addresses *
            </label>
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="Enter email addresses, one per line or comma-separated&#10;e.g., speaker1@example.com&#10;speaker2@example.com"
              required
              rows={4}
              className="w-full px-3 py-2 border border-border rounded text-sm font-mono"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-body mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g., speaker@example.com"
              required
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-body mb-1">
            Reason *
          </label>
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="e.g., Accepted speaker, Organizer, VIP"
            required
            className="w-full px-3 py-2 border border-border rounded text-sm"
          />
          <p className="text-xs text-muted mt-1">
            This reason will be shown to them during registration
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-body border border-border rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || (!bulkMode && !newEmail) || (bulkMode && !bulkEmails) || !newReason}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Adding...' : bulkMode ? 'Add All' : 'Add Email'}
          </button>
        </div>
      </form>
    </div>
  );
}
