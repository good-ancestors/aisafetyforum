import { getAllDiscountCodes, getAllFreeTicketEmails } from '@/lib/admin-actions';
import { eventConfig } from '@/lib/config';
import { getWaitlistSignups, getWaitlistStats } from '@/lib/waitlist-actions';
import DiscountCodeList from './DiscountCodeList';
import FreeTicketEmailList from './FreeTicketEmailList';
import WaitlistTable from './WaitlistTable';

const MODE_STYLES = {
  open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
  gated: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Gated (Invite Only)' },
  closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
};

export default async function AdminDiscountsPage() {
  const [discountCodes, freeTicketEmails, waitlistSignups, waitlistStats] = await Promise.all([
    getAllDiscountCodes(),
    getAllFreeTicketEmails(),
    getWaitlistSignups(),
    getWaitlistStats(),
  ]);

  // Calculate stats
  const accessCodesCount = discountCodes.filter((c) => c.grantsAccess).length;
  const totalCodeUses = discountCodes.reduce(
    (sum, c) => sum + c._count.orders + c._count.registrations,
    0
  );
  const activeFreeEmailsCount = freeTicketEmails.filter((e) => e.active).length;

  const mode = eventConfig.registrationMode;
  const modeStyle = MODE_STYLES[mode];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl font-bold text-navy">
          Discounts & Complimentary Tickets
        </h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${modeStyle.bg} ${modeStyle.text}`}>
          Registration: {modeStyle.label}
        </div>
      </div>
      <p className="text-muted mb-8">
        Manage discount codes, access codes, and email-based complimentary tickets.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Discount Codes</p>
          <p className="text-2xl font-bold text-navy">{discountCodes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Access Codes</p>
          <p className="text-2xl font-bold text-orange-600">{accessCodesCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Code Uses</p>
          <p className="text-2xl font-bold text-teal">{totalCodeUses}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Free Ticket Emails</p>
          <p className="text-2xl font-bold text-purple-600">{activeFreeEmailsCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Waitlist</p>
          <p className="text-2xl font-bold text-yellow-600">{waitlistStats.pending}</p>
        </div>
      </div>

      {/* Discount Code List */}
      <div className="mb-8">
        <DiscountCodeList
          discountCodes={discountCodes.map((c) => ({
            id: c.id,
            code: c.code,
            description: c.description,
            type: c.type,
            value: c.value,
            active: c.active,
            grantsAccess: c.grantsAccess,
            maxUses: c.maxUses,
            validFor: c.validFor,
            allowedEmails: c.allowedEmails,
            validFrom: c.validFrom,
            validUntil: c.validUntil,
            createdAt: c.createdAt,
            usageCount: c._count.orders + c._count.registrations,
          }))}
        />
      </div>

      {/* Waitlist Table */}
      <div className="mb-8">
        <WaitlistTable
          signups={waitlistSignups.map((s) => ({
            id: s.id,
            email: s.email,
            status: s.status,
            code: s.code,
            createdAt: s.createdAt,
          }))}
        />
      </div>

      {/* Free Ticket Email List */}
      <FreeTicketEmailList
        emails={freeTicketEmails.map((e) => ({
          id: e.id,
          email: e.email,
          reason: e.reason,
          active: e.active,
          notified: e.notified,
          createdAt: e.createdAt,
        }))}
      />
    </main>
  );
}
