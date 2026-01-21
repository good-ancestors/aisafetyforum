import { getAllDiscountCodes, getAllFreeTicketEmails } from '@/lib/admin-actions';
import DiscountCodeList from './DiscountCodeList';
import FreeTicketEmailList from './FreeTicketEmailList';

export default async function AdminDiscountsPage() {
  const [discountCodes, freeTicketEmails] = await Promise.all([
    getAllDiscountCodes(),
    getAllFreeTicketEmails(),
  ]);

  // Calculate stats
  const activeCodesCount = discountCodes.filter((c) => c.active).length;
  const totalCodeUses = discountCodes.reduce(
    (sum, c) => sum + c._count.orders + c._count.registrations,
    0
  );
  const activeFreeEmailsCount = freeTicketEmails.filter((e) => e.active).length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Discounts & Complimentary Tickets
      </h1>
      <p className="text-[--text-muted] mb-8">
        Manage discount codes and email-based complimentary tickets.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Discount Codes</p>
          <p className="text-2xl font-bold text-[--navy]">{discountCodes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Active Codes</p>
          <p className="text-2xl font-bold text-green-600">{activeCodesCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Code Uses</p>
          <p className="text-2xl font-bold text-[--teal]">{totalCodeUses}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Free Ticket Emails</p>
          <p className="text-2xl font-bold text-purple-600">{activeFreeEmailsCount}</p>
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
