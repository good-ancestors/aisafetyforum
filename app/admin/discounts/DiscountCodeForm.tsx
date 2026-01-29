'use client';

import { useTransition } from 'react';
import { createDiscountCode, updateDiscountCode } from '@/lib/admin-actions';

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  grantsAccess: boolean;
  maxUses: number | null;
  validFor: string[];
  allowedEmails: string[];
  validFrom: Date | null;
  validUntil: Date | null;
}

export interface CodeFormData {
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

export const emptyFormData: CodeFormData = {
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

function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function codeToFormData(code: DiscountCode): CodeFormData {
  return {
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
  };
}

interface DiscountCodeFormProps {
  editingId: string | null;
  formData: CodeFormData;
  setFormData: (data: CodeFormData) => void;
  onClose: () => void;
}

// eslint-disable-next-line max-lines-per-function -- Discount code form with many configurable fields
export default function DiscountCodeForm({
  editingId,
  formData,
  setFormData,
  onClose,
}: DiscountCodeFormProps) {
  const [isPending, startTransition] = useTransition();

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
        onClose();
        window.location.reload();
      } else {
        alert(result.error || 'Failed to save discount code');
      }
    });
  };

  const toggleTicketType = (ticketType: string) => {
    setFormData({
      ...formData,
      validFor: formData.validFor.includes(ticketType)
        ? formData.validFor.filter((t) => t !== ticketType)
        : [...formData.validFor, ticketType],
    });
  };

  return (
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
          onClick={onClose}
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
  );
}
