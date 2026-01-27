'use client';

import { ticketTiers, isEarlyBirdActive, type TicketTierId } from '@/lib/stripe-config';

export type AttendeeFormData = {
  email: string;
  name: string;
  role: string;
  organisation: string;
  ticketType: TicketTierId | '';
  freeTicketReason?: string | null;
};

interface AttendeeCardProps {
  index: number;
  attendee: AttendeeFormData;
  isPurchaserAttendee: boolean;
  purchaserEmail: string;
  purchaserName: string;
  purchaserRole: string;
  purchaserOrg: string;
  purchaserFreeTicket: string | null;
  totalAttendees: number;
  onUpdateAttendee: (index: number, field: keyof AttendeeFormData, value: string) => void;
  onRemoveAttendee: (index: number) => void;
  onEmailBlur: (index: number) => void;
}

export default function AttendeeCard({
  index,
  attendee,
  isPurchaserAttendee,
  purchaserEmail,
  purchaserName,
  purchaserRole,
  purchaserOrg,
  purchaserFreeTicket,
  totalAttendees,
  onUpdateAttendee,
  onRemoveAttendee,
  onEmailBlur,
}: AttendeeCardProps) {
  const isFirstAndPurchaser = index === 0 && isPurchaserAttendee;
  const email = isFirstAndPurchaser ? purchaserEmail : attendee.email;
  const name = isFirstAndPurchaser ? purchaserName : attendee.name;
  const role = isFirstAndPurchaser ? purchaserRole : attendee.role;
  const organisation = isFirstAndPurchaser ? purchaserOrg : attendee.organisation;
  const freeReason = isFirstAndPurchaser ? purchaserFreeTicket : attendee.freeTicketReason;

  const earlyBird = isEarlyBirdActive();

  return (
    <div className="border border-border rounded-lg p-4 relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-navy">
          Attendee {index + 1}
          {isFirstAndPurchaser && (
            <span className="ml-2 text-xs font-normal text-muted">(You)</span>
          )}
        </h3>
        {totalAttendees > 1 && (
          <button
            type="button"
            onClick={() => onRemoveAttendee(index)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onUpdateAttendee(index, 'email', e.target.value)}
            onBlur={() => onEmailBlur(index)}
            disabled={isFirstAndPurchaser}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:bg-gray-100"
          />
          {freeReason && (
            <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Complimentary ticket</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onUpdateAttendee(index, 'name', e.target.value)}
            disabled={isFirstAndPurchaser}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Role / Title
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => onUpdateAttendee(index, 'role', e.target.value)}
            disabled={isFirstAndPurchaser}
            placeholder="e.g., Research Scientist"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Organisation
          </label>
          <input
            type="text"
            value={organisation}
            onChange={(e) => onUpdateAttendee(index, 'organisation', e.target.value)}
            disabled={isFirstAndPurchaser}
            placeholder="Your organisation"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Ticket Type - Radio Card Style */}
      <div>
        <label className="block text-sm font-medium text-navy mb-2">
          Ticket Type *
        </label>
        <div className="space-y-2">
          {ticketTiers.map((tier) => (
            <label
              key={tier.id}
              className={`flex items-center justify-between p-3 border-l-4 ${tier.borderColor} bg-cream rounded cursor-pointer hover:bg-light transition-colors ${
                attendee.ticketType === tier.id ? 'ring-2 ring-cyan' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`ticketType-${index}`}
                  value={tier.id}
                  checked={attendee.ticketType === tier.id}
                  onChange={(e) => onUpdateAttendee(index, 'ticketType', e.target.value)}
                  className="w-4 h-4 text-cyan border-border focus:ring-cyan"
                />
                <div>
                  <div className="font-bold text-navy text-sm">{tier.name}</div>
                  <div className="text-xs text-muted">{tier.description}</div>
                </div>
              </div>
              <div className="text-right">
                {freeReason ? (
                  <>
                    <div className="text-xs text-muted line-through">
                      {earlyBird ? tier.earlyBirdPriceDisplay : tier.priceDisplay}
                    </div>
                    <div className="font-bold text-green-600">$0.00</div>
                  </>
                ) : earlyBird ? (
                  <>
                    <div className="text-xs text-muted line-through">{tier.priceDisplay}</div>
                    <div className={`font-bold ${tier.textColor}`}>{tier.earlyBirdPriceDisplay}</div>
                  </>
                ) : (
                  <div className={`font-bold ${tier.textColor}`}>{tier.priceDisplay}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
