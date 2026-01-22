'use client';

import { useState, useTransition } from 'react';
import { toggleAuthUserAdmin } from '@/lib/admin-actions';

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

interface AuthUser {
  id: string; // neon_auth.user.id (UUID)
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: Date;
  hasProfile: boolean;
  isAdmin: boolean;
  organisation: string | null;
  title: string | null;
  ticketCount: number;
  speakerProposalCount: number;
  scholarshipCount: number;
}

interface AuthUserListProps {
  authUsers: AuthUser[];
}

type StatusFilter = 'all' | 'with-profile' | 'no-profile' | 'admin';

export default function AuthUserList({ authUsers }: AuthUserListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localUsers, setLocalUsers] = useState(authUsers);

  const filteredUsers = localUsers.filter((user) => {
    if (statusFilter === 'with-profile' && !user.hasProfile) return false;
    if (statusFilter === 'no-profile' && user.hasProfile) return false;
    if (statusFilter === 'admin' && !user.isAdmin) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.organisation?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleToggleAdmin = (authUserId: string) => {
    startTransition(async () => {
      const result = await toggleAuthUserAdmin(authUserId);
      if (result.success && result.isAdmin !== undefined) {
        setLocalUsers((prev) =>
          prev.map((u) =>
            u.id === authUserId
              ? { ...u, isAdmin: result.isAdmin!, hasProfile: true }
              : u
          )
        );
      } else {
        alert(result.error || 'Failed to update admin status');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-[--border]">
      {/* Filters */}
      <div className="p-4 border-b border-[--border] flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[--border] rounded text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 border border-[--border] rounded text-sm"
        >
          <option value="all">All Users</option>
          <option value="with-profile">With Profile</option>
          <option value="no-profile">No Profile Yet</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-[--bg-light] text-sm text-[--text-muted] border-b border-[--border]">
        Showing {filteredUsers.length} of {localUsers.length} auth users
      </div>

      {/* User List */}
      <div className="divide-y divide-[--border]">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-[--text-muted]">No users found</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[--navy]">
                      {user.name || 'No name'}
                    </span>
                    {user.isAdmin && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                    {!user.hasProfile && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        No Profile
                      </span>
                    )}
                    {user.emailVerified && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[--text-muted] mt-1">
                    {user.email}
                    {user.organisation && <span className="ml-2">• {user.organisation}</span>}
                    {user.title && <span className="ml-2">• {user.title}</span>}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[--text-muted]">
                    <span>Signed up {formatDate(user.createdAt)}</span>
                    {user.ticketCount > 0 && (
                      <span className="text-green-600">{user.ticketCount} ticket(s)</span>
                    )}
                    {user.speakerProposalCount > 0 && (
                      <span className="text-[--blue]">
                        {user.speakerProposalCount} speaker proposal(s)
                      </span>
                    )}
                    {user.scholarshipCount > 0 && (
                      <span className="text-[--teal]">
                        {user.scholarshipCount} scholarship app(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    disabled={isPending}
                    className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                      user.isAdmin
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
