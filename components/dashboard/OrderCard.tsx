'use client';

export interface OrderRegistration {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  profile?: {
    id: string;
    name: string | null;
  } | null;
}

export interface OrderCardProps {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: Date;
  registrations: OrderRegistration[];
  invoiceNumber?: string | null;
  invoiceDueDate?: Date | null;
  orgName?: string | null;
  orgABN?: string | null;
  actions?: React.ReactNode;
}

export default function OrderCard({
  id,
  totalAmount,
  paymentStatus,
  paymentMethod,
  createdAt,
  registrations,
  invoiceNumber,
  invoiceDueDate,
  orgName,
  orgABN,
  actions,
}: OrderCardProps) {
  const orderId = `#${id.slice(-8).toUpperCase()}`;
  const isPending = paymentStatus === 'pending';
  const isInvoice = paymentMethod === 'invoice';

  const statusBadge = isPending ? (
    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">
      Awaiting Payment
    </span>
  ) : (
    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
      Paid
    </span>
  );

  const containerClass = isPending
    ? 'border border-amber-200 rounded-lg overflow-hidden bg-amber-50/50'
    : 'border border-[--border] rounded-lg overflow-hidden';

  const headerClass = isPending
    ? 'bg-amber-100/50 px-4 py-3 border-b border-amber-200'
    : 'bg-[--bg-light] px-4 py-3 border-b border-[--border]';

  const registrationBgClass = isPending
    ? 'bg-white p-3 rounded border border-amber-100'
    : 'bg-[--bg-light] p-3 rounded';

  const footerClass = isPending
    ? 'bg-amber-100/50 px-4 py-3 border-t border-amber-200'
    : 'bg-[--bg-light] px-4 py-3 border-t border-[--border]';

  return (
    <div className={containerClass}>
      {/* Order Header */}
      <div className={headerClass}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[--navy]">Order {orderId}</span>
              {statusBadge}
            </div>
            <p className="text-xs text-[--text-muted]">
              {registrations.length} ticket(s) • ${(totalAmount / 100).toFixed(2)} AUD
            </p>
            <p className="text-xs text-[--text-muted]">
              {new Date(createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {isInvoice ? 'Invoice' : 'Card Payment'}
              {isPending && invoiceDueDate && (
                <> • Due {new Date(invoiceDueDate).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</>
              )}
            </p>
          </div>
          {actions && (
            <div className="ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Tickets in Order */}
      <div className="p-4">
        <p className="text-sm font-medium text-[--text-muted] mb-3">
          {registrations.length} Ticket(s)
          {isPending && ' - will be confirmed upon payment'}
        </p>
        <div className="space-y-2">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className={`flex justify-between items-center text-sm ${registrationBgClass}`}
            >
              <div>
                <span className="font-medium text-[--navy]">{reg.name}</span>
                <span className="text-[--text-muted] ml-2">({reg.email})</span>
              </div>
              <span className="text-[--text-muted]">{reg.ticketType}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Details (if applicable) */}
      {isInvoice && invoiceNumber && (
        <div className={footerClass}>
          <p className="text-xs text-[--text-muted]">
            Invoice: {invoiceNumber}
            {orgName && ` • ${orgName}`}
            {orgABN && ` • ABN: ${orgABN}`}
          </p>
        </div>
      )}
    </div>
  );
}
