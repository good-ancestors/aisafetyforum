'use client';

import { useState, useTransition } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { toggleDiscountCodeStatus, deleteDiscountCode } from '@/lib/admin-actions';
import DiscountCodeForm, {
  type CodeFormData,
  emptyFormData,
  codeToFormData,
} from './DiscountCodeForm';

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

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  active: boolean;
  grantsAccess: boolean;
  maxUses: number | null;
  validFor: string[];
  allowedEmails: string[];
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  usageCount: number;
}

interface DiscountCodeListProps {
  discountCodes: DiscountCode[];
}

type StatusFilter = 'all' | 'active' | 'inactive';

// eslint-disable-next-line max-lines-per-function -- Admin list with filters, actions and item display
export default function DiscountCodeList({ discountCodes }: DiscountCodeListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CodeFormData>(emptyFormData);
  const [localCodes, setLocalCodes] = useState(discountCodes);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCodes = localCodes.filter((code) => {
    if (statusFilter === 'active' && !code.active) return false;
    if (statusFilter === 'inactive' && code.active) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        code.code.toLowerCase().includes(searchLower) ||
        code.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setShowForm(true);
  };

  const openEditForm = (code: DiscountCode) => {
    setEditingId(code.id);
    setFormData(codeToFormData(code));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleDiscountCodeStatus(id);
      if (result.success && result.active !== undefined) {
        setLocalCodes((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: result.active! } : c))
        );
      } else {
        alert(result.error || 'Failed to update status');
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteDiscountCode(deleteId);
      if (result.success) {
        setLocalCodes((prev) => prev.filter((c) => c.id !== deleteId));
        setDeleteId(null);
      } else {
        alert(result.error || 'Failed to delete discount code');
        setDeleteId(null);
      }
    });
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% off`;
      case 'fixed':
        return `$${(value / 100).toFixed(2)} off`;
      case 'free':
        return 'Free ticket';
      default:
        return value.toString();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-border">
        {/* Header with Create Button */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-semibold text-navy">Discount Codes</h2>
          <button
            onClick={showForm ? closeForm : openCreateForm}
            className="px-4 py-2 bg-navy text-white rounded text-sm hover:bg-navy-light transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Code'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <DiscountCodeForm
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            onClose={closeForm}
          />
        )}

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search codes..."
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
          Showing {filteredCodes.length} of {localCodes.length} codes
        </div>

        {/* Code List */}
        <div className="divide-y divide-border">
          {filteredCodes.length === 0 ? (
            <div className="p-8 text-center text-muted">No discount codes found</div>
          ) : (
            filteredCodes.map((code) => (
              <div key={code.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-navy">{code.code}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {code.active ? 'Active' : 'Inactive'}
                      </span>
                      {code.grantsAccess && (
                        <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                          Access Code
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded bg-light text-muted">
                        {formatValue(code.type, code.value)}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">{code.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                      <span>
                        Used: {code.usageCount}
                        {code.maxUses && code.maxUses > 0 ? ` / ${code.maxUses}` : ' (unlimited)'}
                      </span>
                      <span>Created: {formatDate(code.createdAt)}</span>
                      {code.validFrom && (
                        <span>From: {formatDate(code.validFrom)}</span>
                      )}
                      {code.validUntil && (
                        <span>Until: {formatDate(code.validUntil)}</span>
                      )}
                    </div>
                    {code.validFor.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted">Valid for:</span>
                        {code.validFor.map((ticket) => (
                          <span
                            key={ticket}
                            className="text-xs bg-light text-muted px-2 py-0.5 rounded"
                          >
                            {ticket}
                          </span>
                        ))}
                      </div>
                    )}
                    {code.allowedEmails.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted">
                          Restricted to {code.allowedEmails.length} email(s):{' '}
                          <span className="font-mono">{code.allowedEmails.slice(0, 3).join(', ')}</span>
                          {code.allowedEmails.length > 3 && ` +${code.allowedEmails.length - 3} more`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => openEditForm(code)}
                      disabled={isPending}
                      className="text-xs px-3 py-1 bg-light text-body rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(code.id)}
                      disabled={isPending}
                      className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                        code.active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {code.active ? 'Deactivate' : 'Activate'}
                    </button>
                    {code.usageCount === 0 && (
                      <button
                        onClick={() => setDeleteId(code.id)}
                        disabled={isPending}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
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
        title="Delete Discount Code"
        message="Are you sure you want to delete this discount code? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
