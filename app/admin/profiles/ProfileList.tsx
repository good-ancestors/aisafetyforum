'use client';

import { useState, useTransition } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { toggleAdminStatus, deleteProfile } from '@/lib/admin-actions';

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

interface Profile {
  id: string;
  name: string | null;
  email: string;
  title: string | null;
  organisation: string | null;
  isAdmin: boolean;
  createdAt: Date;
  ticketCount: number;
  speakerProposalCount: number;
  scholarshipCount: number;
}

interface ProfileListProps {
  profiles: Profile[];
}

type RoleFilter = 'all' | 'admin' | 'user';

export default function ProfileList({ profiles }: ProfileListProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localProfiles, setLocalProfiles] = useState(profiles);
  const [deleteId, setDeleteId] = useState<{ id: string; name: string; hasTickets: boolean } | null>(null);

  const filteredProfiles = localProfiles.filter((profile) => {
    if (roleFilter === 'admin' && !profile.isAdmin) return false;
    if (roleFilter === 'user' && profile.isAdmin) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.email.toLowerCase().includes(searchLower) ||
        profile.organisation?.toLowerCase().includes(searchLower) ||
        profile.title?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleToggleAdmin = (profileId: string) => {
    startTransition(async () => {
      const result = await toggleAdminStatus(profileId);
      if (result.success && result.isAdmin !== undefined) {
        setLocalProfiles((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, isAdmin: result.isAdmin! } : p))
        );
      } else {
        alert(result.error || 'Failed to update admin status');
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteProfile(deleteId.id);
      if (result.success) {
        setLocalProfiles((prev) => prev.filter((p) => p.id !== deleteId.id));
        setDeleteId(null);
      } else {
        alert(result.error || 'Failed to delete profile');
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-border">
      {/* Filters */}
      <div className="p-4 border-b border-border flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-border rounded text-sm flex-1 min-w-[200px]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="px-3 py-2 border border-border rounded text-sm"
        >
          <option value="all">All Users</option>
          <option value="admin">Admins Only</option>
          <option value="user">Regular Users</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-light text-sm text-muted border-b border-border">
        Showing {filteredProfiles.length} of {localProfiles.length} users
      </div>

      {/* Profile List */}
      <div className="divide-y divide-border">
        {filteredProfiles.length === 0 ? (
          <div className="p-8 text-center text-muted">No users found</div>
        ) : (
          filteredProfiles.map((profile) => (
            <div key={profile.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy">
                      {profile.name || 'No name'}
                    </span>
                    {profile.isAdmin && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {profile.email}
                    {profile.organisation && <span className="ml-2">• {profile.organisation}</span>}
                    {profile.title && <span className="ml-2">• {profile.title}</span>}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                    <span>
                      Joined {formatDate(profile.createdAt)}
                    </span>
                    {profile.ticketCount > 0 && (
                      <span className="text-green-600">{profile.ticketCount} ticket(s)</span>
                    )}
                    {profile.speakerProposalCount > 0 && (
                      <span className="text-blue">
                        {profile.speakerProposalCount} speaker proposal(s)
                      </span>
                    )}
                    {profile.scholarshipCount > 0 && (
                      <span className="text-teal">
                        {profile.scholarshipCount} scholarship app(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleToggleAdmin(profile.id)}
                    disabled={isPending}
                    className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                      profile.isAdmin
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {profile.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() =>
                      setDeleteId({
                        id: profile.id,
                        name: profile.name || profile.email,
                        hasTickets: profile.ticketCount > 0,
                      })
                    }
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

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <ConfirmationDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={deleteId.hasTickets ? () => setDeleteId(null) : handleDelete}
          title="Delete User"
          message={
            deleteId.hasTickets
              ? `Cannot delete ${deleteId.name} because they have active tickets. Cancel their tickets first.`
              : `Are you sure you want to delete ${deleteId.name}? This will also delete their speaker proposals and scholarship applications. This action cannot be undone.`
          }
          confirmLabel={deleteId.hasTickets ? 'OK' : 'Delete'}
          cancelLabel={deleteId.hasTickets ? '' : 'Cancel'}
          variant={deleteId.hasTickets ? 'warning' : 'danger'}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
