'use client';

import { useState, useTransition } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import {
  toggleFreeTicketEmailStatus,
  deleteFreeTicketEmail,
  updateFreeTicketEmail,
} from '@/lib/admin-actions';
import FreeTicketEmailForm from './FreeTicketEmailForm';

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

interface FreeTicketEmail {
  id: string;
  email: string;
  reason: string;
  active: boolean;
  notified: boolean;
  createdAt: Date;
}

interface FreeTicketEmailListProps {
  emails: FreeTicketEmail[];
}

type StatusFilter = 'all' | 'active' | 'inactive';

// eslint-disable-next-line max-lines-per-function -- Admin list with filters, inline edit, and actions
export default function FreeTicketEmailList({ emails }: FreeTicketEmailListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');
  const [localEmails, setLocalEmails] = useState(emails);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredEmails = localEmails.filter((email) => {
    if (statusFilter === 'active' && !email.active) return false;
    if (statusFilter === 'inactive' && email.active) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        email.email.toLowerCase().includes(searchLower) ||
        email.reason.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleFreeTicketEmailStatus(id);
      if (result.success && result.active !== undefined) {
        setLocalEmails((prev) =>
          prev.map((e) => (e.id === id ? { ...e, active: result.active! } : e))
        );
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update status' });
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteFreeTicketEmail(deleteId);
      if (result.success) {
        setLocalEmails((prev) => prev.filter((e) => e.id !== deleteId));
        setDeleteId(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete email' });
        setDeleteId(null);
      }
    });
  };

  const handleEditReason = (id: string) => {
    startTransition(async () => {
      const result = await updateFreeTicketEmail(id, editReason);
      if (result.success) {
        setLocalEmails((prev) =>
          prev.map((e) => (e.id === id ? { ...e, reason: editReason } : e))
        );
        setEditingId(null);
        setEditReason('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update reason' });
      }
    });
  };

  const startEdit = (email: FreeTicketEmail) => {
    setEditingId(email.id);
    setEditReason(email.reason);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-border">
        {/* Header with Add Button */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-navy">Complimentary Ticket Emails</h2>
            <p className="text-xs text-muted mt-1">
              Emails here automatically get free tickets when they register (no code needed)
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-navy text-white rounded text-sm hover:bg-navy-light transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Email(s)'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-4 mt-4 p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right text-current opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <FreeTicketEmailForm
            onClose={() => setShowAddForm(false)}
            onSuccess={(text) => setMessage({ type: 'success', text })}
            onError={(text) => setMessage({ type: 'error', text })}
          />
        )}

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-border rounded text-sm flex-1 min-w-[200px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-border rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="px-4 py-2 bg-light text-sm text-muted border-b border-border">
          Showing {filteredEmails.length} of {localEmails.length} emails
        </div>

        {/* Email List */}
        <div className="divide-y divide-border">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No complimentary ticket emails found
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-navy">{email.email}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          email.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {email.active ? 'Active' : 'Inactive'}
                      </span>
                      {email.notified && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Notified
                        </span>
                      )}
                    </div>
                    {editingId === email.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-border rounded"
                        />
                        <button
                          onClick={() => handleEditReason(email.id)}
                          disabled={isPending || !editReason}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted mt-1">{email.reason}</p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      Added: {formatDate(email.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    {editingId !== email.id && (
                      <button
                        onClick={() => startEdit(email)}
                        disabled={isPending}
                        className="text-xs px-3 py-1 bg-light text-body rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(email.id)}
                      disabled={isPending}
                      className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                        email.active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {email.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setDeleteId(email.id)}
                      disabled={isPending}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Free Ticket Email"
        message="Are you sure you want to delete this email? They will no longer receive a free ticket automatically."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
