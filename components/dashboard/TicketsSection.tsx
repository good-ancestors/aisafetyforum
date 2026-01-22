'use client';

import Link from 'next/link';
import TicketCard from './TicketCard';
import CancelTicketButton from '@/app/dashboard/tickets/CancelTicketButton';

interface Registration {
  id: string;
  ticketType: string;
  name: string;
  status: string;
  ticketPrice: number | null;
  amountPaid: number | null;
  createdAt: Date;
  order?: {
    id: string;
  } | null;
}

interface TicketsSectionProps {
  registrations: Registration[];
  maxItems?: number;
  showViewAllLink?: boolean;
  title?: string;
  description?: string;
}

export default function TicketsSection({
  registrations,
  maxItems,
  showViewAllLink = false,
  title = 'My Tickets',
  description = 'Tickets registered to your email address',
}: TicketsSectionProps) {
  const displayedRegistrations = maxItems
    ? registrations.slice(0, maxItems)
    : registrations;
  const remainingCount = maxItems ? registrations.length - maxItems : 0;

  if (registrations.length === 0) {
    return (
      <section className="bg-white rounded-lg border border-[--border] p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-serif text-xl font-bold text-[--navy]">{title}</h2>
          {showViewAllLink && (
            <Link href="/dashboard/tickets" className="text-sm text-[--blue] hover:underline">
              View All Tickets
            </Link>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-[--text-muted] mb-4">You don&apos;t have any tickets yet.</p>
          <Link
            href="/register"
            className="inline-block bg-[--navy] text-white px-6 py-2 rounded hover:bg-[--navy-light] transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-[--border] p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[--navy]">{title}</h2>
          {description && <p className="text-sm text-[--text-muted] mt-1">{description}</p>}
        </div>
        {showViewAllLink && (
          <Link href="/dashboard/tickets" className="text-sm text-[--blue] hover:underline">
            View All Tickets
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {displayedRegistrations.map((reg) => (
          <TicketCard
            key={reg.id}
            id={reg.id}
            ticketType={reg.ticketType}
            name={reg.name}
            status={reg.status}
            ticketPrice={reg.ticketPrice}
            amountPaid={reg.amountPaid}
            createdAt={reg.createdAt}
            order={reg.order}
            actions={
              <CancelTicketButton
                registrationId={reg.id}
                ticketType={reg.ticketType}
                attendeeName={reg.name}
                ticketPrice={reg.ticketPrice ?? reg.amountPaid ?? 0}
                status={reg.status}
              />
            }
          />
        ))}
        {remainingCount > 0 && (
          <p className="text-sm text-[--text-muted]">+ {remainingCount} more ticket(s)</p>
        )}
      </div>
    </section>
  );
}
