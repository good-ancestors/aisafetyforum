'use client';

import { useState, useTransition } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { updateWaitlistStatus, deleteWaitlistSignup } from '@/lib/waitlist-actions';

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  });
}

interface WaitlistSignup {
  id: string;
  email: string;
  status: string;
  code: { code: string; description: string } | null;
  createdAt: Date;
}

interface WaitlistTableProps {
  signups: WaitlistSignup[];
}

type StatusFilter = 'all' | 'pending' | 'notified' | 'registered';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  notified: 'bg-blue-100 text-blue-800',
  registered: 'bg-green-100 text-green-800',
};

export default function WaitlistTable({ signups }: WaitlistTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [localSignups, setLocalSignups] = useState(signups);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredSignups = localSignups.filter((signup) => {
    if (statusFilter !== 'all' && signup.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return signup.email.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
      const result = await updateWaitlistStatus(id, newStatus);
      if (result.success) {
        setLocalSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const result = await deleteWaitlistSignup(id);
      if (result.success) {
        setLocalSignups((prev) => prev.filter((s) => s.id !== id));
      }
    });
    setDeleteId(null);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
  };

  // Stats
  const pendingCount = localSignups.filter((s) => s.status === 'pending').length;
  const notifiedCount = localSignups.filter((s) => s.status === 'notified').length;
  const registeredCount = localSignups.filter((s) => s.status === 'registered').length;

  return (
    <div className="bg-white rounded-lg border border-[--border]">
      <div className="p-4 border-b border-[--border]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[--navy]">Waitlist Signups</h2>
          <div className="flex items-center gap-4 text-sm text-[--text-muted]">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              {pendingCount} pending
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {notifiedCount} notified
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              {registeredCount} registered
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-[--border] rounded-md text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-[--border] rounded-md text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="notified">Notified</option>
            <option value="registered">Registered</option>
          </select>
        </div>
      </div>

      {filteredSignups.length === 0 ? (
        <div className="p-8 text-center text-[--text-muted]">
          {localSignups.length === 0
            ? 'No waitlist signups yet'
            : 'No signups match your filters'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[--bg-light]">
              <tr>
                <th className="text-left text-xs font-medium text-[--text-muted] uppercase tracking-wider px-4 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-[--text-muted] uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-[--text-muted] uppercase tracking-wider px-4 py-3">
                  Code Sent
                </th>
                <th className="text-left text-xs font-medium text-[--text-muted] uppercase tracking-wider px-4 py-3">
                  Signed Up
                </th>
                <th className="text-right text-xs font-medium text-[--text-muted] uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {filteredSignups.map((signup) => (
                <tr key={signup.id} className="hover:bg-[--bg-light]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{signup.email}</span>
                      <button
                        onClick={() => copyEmail(signup.email)}
                        className="text-[--text-muted] hover:text-[--navy]"
                        title="Copy email"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={signup.status}
                      onChange={(e) => handleStatusChange(signup.id, e.target.value)}
                      disabled={isPending}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 ${STATUS_COLORS[signup.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="notified">Notified</option>
                      <option value="registered">Registered</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-[--text-muted]">
                    {signup.code ? (
                      <span className="font-mono text-xs bg-[--bg-light] px-2 py-1 rounded">
                        {signup.code.code}
                      </span>
                    ) : (
                      <span className="text-[--text-muted]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[--text-muted]">
                    {formatDate(signup.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(signup.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteId}
        title="Delete Waitlist Signup"
        message="Are you sure you want to remove this email from the waitlist? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
