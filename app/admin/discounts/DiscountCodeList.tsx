'use client';

import { useState, useTransition } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import {
  createDiscountCode,
  updateDiscountCode,
  toggleDiscountCodeStatus,
  deleteDiscountCode,
} from '@/lib/admin-actions';

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

function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
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

interface CodeFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  maxUses: number;
  validFor: string[];
  allowedEmails: string;
  validFrom: string;
  validUntil: string;
  grantsAccess: boolean;
}

const TICKET_TYPES = [
  'Standard',
  'Student',
  'Government/Non-Profit',
  'Speaker',
];

const emptyFormData: CodeFormData = {
  code: '',
  description: '',
  type: 'percentage',
  value: 0,
  maxUses: 0,
  validFor: [],
  allowedEmails: '',
  validFrom: '',
  validUntil: '',
  grantsAccess: false,
};

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
    setFormData({
      code: code.code,
      description: code.description,
      type: code.type as 'percentage' | 'fixed' | 'free',
      value: code.type === 'fixed' ? code.value / 100 : code.value,
      maxUses: code.maxUses || 0,
      validFor: code.validFor,
      allowedEmails: code.allowedEmails.join('\n'),
      validFrom: formatDateForInput(code.validFrom),
      validUntil: formatDateForInput(code.validUntil),
      grantsAccess: code.grantsAccess,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        code: formData.code,
        description: formData.description,
        type: formData.type,
        value: formData.type === 'free' ? 100 : formData.type === 'fixed' ? Math.round(formData.value * 100) : formData.value,
        maxUses: formData.maxUses || undefined,
        validFor: formData.validFor.length > 0 ? formData.validFor : undefined,
        allowedEmails: formData.allowedEmails
          .split(/[\n,]/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0),
        validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
        grantsAccess: formData.grantsAccess,
      };

      let result;
      if (editingId) {
        result = await updateDiscountCode(editingId, payload);
      } else {
        result = await createDiscountCode(payload);
      }

      if (result.success) {
        closeForm();
        window.location.reload();
      } else {
        alert(result.error || 'Failed to save discount code');
      }
    });
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

  const toggleTicketType = (ticketType: string) => {
    setFormData((prev) => ({
      ...prev,
      validFor: prev.validFor.includes(ticketType)
        ? prev.validFor.filter((t) => t !== ticketType)
        : [...prev.validFor, ticketType],
    }));
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-[--border]">
        {/* Header with Create Button */}
        <div className="p-4 border-b border-[--border] flex justify-between items-center">
          <h2 className="font-semibold text-[--navy]">Discount Codes</h2>
          <button
            onClick={showForm ? closeForm : openCreateForm}
            className="px-4 py-2 bg-navy text-white rounded text-sm hover:bg-navy-light transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Code'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border-b border-[--border] bg-[--bg-light]">
            <h3 className="font-medium text-[--navy] mb-4">
              {editingId ? 'Edit Discount Code' : 'Create Discount Code'}
            </h3>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., EARLYBIRD20"
                  required
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Early bird discount"
                  required
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                />
              </div>
            </div>

            {/* Type, Value, Max Uses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'percentage' | 'fixed' | 'free',
                    })
                  }
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                  <option value="free">Free Ticket (100% off)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Value {formData.type === 'percentage' ? '(%)' : formData.type === 'fixed' ? '($)' : ''}
                </label>
                <input
                  type="number"
                  value={formData.type === 'free' ? '' : formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={formData.type === 'free' ? 'N/A' : '0'}
                  disabled={formData.type === 'free'}
                  min={0}
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step={formData.type === 'fixed' ? '0.01' : '1'}
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Max Uses (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                />
              </div>
            </div>

            {/* Grants Access Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.grantsAccess}
                  onChange={(e) => setFormData({ ...formData, grantsAccess: e.target.checked })}
                  className="w-4 h-4 rounded border-[--border] text-[--navy] focus:ring-[--cyan]"
                />
                <div>
                  <span className="text-sm font-medium text-[--text-body]">Grants Early Access</span>
                  <p className="text-xs text-[--text-muted]">
                    When enabled, this code allows registration even when registration is gated (invite-only).
                  </p>
                </div>
              </label>
            </div>

            {/* Valid Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Valid From (optional)
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-body] mb-1">
                  Valid Until (optional)
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-[--border] rounded text-sm"
                />
              </div>
            </div>

            {/* Valid For Ticket Types */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[--text-body] mb-2">
                Valid For Ticket Types (leave empty for all types)
              </label>
              <div className="flex flex-wrap gap-2">
                {TICKET_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleTicketType(type)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      formData.validFor.includes(type)
                        ? 'bg-navy text-white border-navy'
                        : 'bg-white text-body border hover:border-navy'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Allowed Emails (for complimentary tickets) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[--text-body] mb-1">
                Restrict to Specific Emails (for complimentary tickets)
              </label>
              <textarea
                value={formData.allowedEmails}
                onChange={(e) => setFormData({ ...formData, allowedEmails: e.target.value })}
                placeholder="Enter email addresses, one per line or comma-separated&#10;e.g., speaker@example.com&#10;vip@company.org"
                rows={3}
                className="w-full px-3 py-2 border border-[--border] rounded text-sm font-mono"
              />
              <p className="text-xs text-[--text-muted] mt-1">
                Leave empty to allow anyone. For speaker/VIP complimentary codes, add their emails here.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-[--text-body] border border-[--border] rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !formData.code || !formData.description}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : editingId ? 'Save Changes' : 'Create Code'}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-[--border] flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search codes..."
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
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="px-4 py-2 bg-[--bg-light] text-sm text-[--text-muted] border-b border-[--border]">
          Showing {filteredCodes.length} of {localCodes.length} codes
        </div>

        {/* Code List */}
        <div className="divide-y divide-[--border]">
          {filteredCodes.length === 0 ? (
            <div className="p-8 text-center text-[--text-muted]">No discount codes found</div>
          ) : (
            filteredCodes.map((code) => (
              <div key={code.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-[--navy]">{code.code}</span>
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
                      <span className="text-xs px-2 py-0.5 rounded bg-[--bg-light] text-[--text-muted]">
                        {formatValue(code.type, code.value)}
                      </span>
                    </div>
                    <p className="text-sm text-[--text-muted] mt-1">{code.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[--text-muted]">
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
                        <span className="text-xs text-[--text-muted]">Valid for:</span>
                        {code.validFor.map((ticket) => (
                          <span
                            key={ticket}
                            className="text-xs bg-[--bg-light] text-[--text-muted] px-2 py-0.5 rounded"
                          >
                            {ticket}
                          </span>
                        ))}
                      </div>
                    )}
                    {code.allowedEmails.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-[--text-muted]">
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
                      className="text-xs px-3 py-1 bg-[--bg-light] text-[--text-body] rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
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
