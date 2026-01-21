'use client';

import { useState, useTransition } from 'react';
import { updateSpeakerProposalStatus, updateScholarshipStatus } from '@/lib/admin-actions';

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

interface SpeakerProposal {
  id: string;
  name: string;
  email: string;
  organisation: string;
  title: string;
  format: string;
  abstract: string;
  travelSupport: string;
  anythingElse: string | null;
  status: string;
  createdAt: Date;
  profile: {
    id: string;
    name: string | null;
    email: string;
    title: string | null;
    organisation: string | null;
  } | null;
}

interface ScholarshipApplication {
  id: string;
  name: string;
  email: string;
  organisation: string;
  role: string;
  amount: string;
  whyAttend: string;
  backgroundInfo: string[];
  travelSupport: string | null;
  status: string;
  createdAt: Date;
  profile: {
    id: string;
    name: string | null;
    email: string;
    title: string | null;
    organisation: string | null;
  } | null;
}

interface ApplicationsTabsProps {
  speakerProposals: SpeakerProposal[];
  scholarshipApplications: ScholarshipApplication[];
}

type Tab = 'speakers' | 'scholarships';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'approved' | 'rejected';

export default function ApplicationsTabs({
  speakerProposals,
  scholarshipApplications,
}: ApplicationsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('speakers');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSpeakerStatus = (id: string, status: 'accepted' | 'rejected') => {
    startTransition(async () => {
      const result = await updateSpeakerProposalStatus(id, status);
      if (!result.success) {
        alert(result.error || 'Failed to update status');
      }
    });
  };

  const handleScholarshipStatus = (id: string, status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await updateScholarshipStatus(id, status);
      if (!result.success) {
        alert(result.error || 'Failed to update status');
      }
    });
  };

  // Filter speaker proposals
  const filteredSpeakers = speakerProposals.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.title.toLowerCase().includes(searchLower) ||
        p.abstract.toLowerCase().includes(searchLower) ||
        p.organisation.toLowerCase().includes(searchLower) ||
        p.format.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Filter scholarship applications
  const filteredScholarships = scholarshipApplications.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        a.organisation.toLowerCase().includes(searchLower) ||
        a.whyAttend.toLowerCase().includes(searchLower) ||
        a.role.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-[--border]">
      {/* Tabs */}
      <div className="flex border-b border-[--border]">
        <button
          onClick={() => {
            setActiveTab('speakers');
            setStatusFilter('all');
          }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'speakers'
              ? 'text-[--navy] border-b-2 border-[--navy] bg-[--bg-light]'
              : 'text-[--text-muted] hover:text-[--navy]'
          }`}
        >
          Speaker Proposals ({speakerProposals.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('scholarships');
            setStatusFilter('all');
          }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'scholarships'
              ? 'text-[--navy] border-b-2 border-[--navy] bg-[--bg-light]'
              : 'text-[--text-muted] hover:text-[--navy]'
          }`}
        >
          Scholarships ({scholarshipApplications.length})
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-[--border] flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[--border] rounded text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-2 border border-[--border] rounded text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          {activeTab === 'speakers' ? (
            <option value="accepted">Accepted</option>
          ) : (
            <option value="approved">Approved</option>
          )}
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 bg-[--bg-light] text-sm text-[--text-muted] border-b border-[--border]">
        Showing{' '}
        {activeTab === 'speakers' ? filteredSpeakers.length : filteredScholarships.length} of{' '}
        {activeTab === 'speakers' ? speakerProposals.length : scholarshipApplications.length}{' '}
        applications
      </div>

      {/* Content */}
      <div className="divide-y divide-[--border]">
        {activeTab === 'speakers' ? (
          filteredSpeakers.length === 0 ? (
            <div className="p-8 text-center text-[--text-muted]">No speaker proposals found</div>
          ) : (
            filteredSpeakers.map((proposal) => (
              <div key={proposal.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[--navy]">
                        {proposal.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(proposal.status)}`}
                      >
                        {proposal.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[--bg-light] text-[--text-muted]">
                        {proposal.format}
                      </span>
                    </div>
                    <p className="text-sm text-[--text-muted] mt-1">
                      {proposal.email}
                      {proposal.organisation && (
                        <span className="ml-2">• {proposal.organisation}</span>
                      )}
                    </p>
                    <p className="text-sm font-medium mt-2">{proposal.title}</p>
                    <p className="text-sm text-[--text-muted] mt-1 line-clamp-2">
                      {proposal.abstract}
                    </p>
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === proposal.id ? null : proposal.id)
                      }
                      className="text-xs text-[--blue] hover:underline mt-2"
                    >
                      {expandedId === proposal.id ? 'Show less' : 'Show full details'}
                    </button>
                    {expandedId === proposal.id && (
                      <div className="mt-3 p-3 bg-[--bg-light] rounded text-sm space-y-2">
                        <div>
                          <p className="font-medium text-[--navy]">Abstract:</p>
                          <p className="whitespace-pre-wrap">{proposal.abstract}</p>
                        </div>
                        <p className="text-[--text-muted]">
                          <strong>Travel support:</strong> {proposal.travelSupport}
                        </p>
                        {proposal.anythingElse && (
                          <p className="text-[--text-muted]">
                            <strong>Other notes:</strong> {proposal.anythingElse}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <p className="text-xs text-[--text-muted] text-right">
                      {formatDate(proposal.createdAt)}
                    </p>
                    {proposal.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSpeakerStatus(proposal.id, 'accepted')}
                          disabled={isPending}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleSpeakerStatus(proposal.id, 'rejected')}
                          disabled={isPending}
                          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        ) : filteredScholarships.length === 0 ? (
          <div className="p-8 text-center text-[--text-muted]">
            No scholarship applications found
          </div>
        ) : (
          filteredScholarships.map((app) => (
            <div key={app.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[--navy]">
                      {app.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[--teal] text-white">
                      {app.amount}
                    </span>
                  </div>
                  <p className="text-sm text-[--text-muted] mt-1">
                    {app.email}
                    {app.organisation && (
                      <span className="ml-2">• {app.organisation}</span>
                    )}
                    {app.role && (
                      <span className="ml-2">• {app.role}</span>
                    )}
                  </p>
                  {app.backgroundInfo.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {app.backgroundInfo.map((info) => (
                        <span
                          key={info}
                          className="text-xs bg-[--bg-light] text-[--text-muted] px-2 py-0.5 rounded"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-[--text-muted] mt-2 line-clamp-2">{app.whyAttend}</p>
                  <button
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    className="text-xs text-[--blue] hover:underline mt-2"
                  >
                    {expandedId === app.id ? 'Show less' : 'Show full application'}
                  </button>
                  {expandedId === app.id && (
                    <div className="mt-3 p-3 bg-[--bg-light] rounded text-sm space-y-3">
                      <div>
                        <p className="font-medium text-[--navy]">Why attend:</p>
                        <p className="whitespace-pre-wrap text-[--text-body]">{app.whyAttend}</p>
                      </div>
                      {app.travelSupport && (
                        <p className="text-[--text-muted]">
                          <strong>Travel support needed:</strong> {app.travelSupport}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <p className="text-xs text-[--text-muted] text-right">
                    {formatDate(app.createdAt)}
                  </p>
                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleScholarshipStatus(app.id, 'approved')}
                        disabled={isPending}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleScholarshipStatus(app.id, 'rejected')}
                        disabled={isPending}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
