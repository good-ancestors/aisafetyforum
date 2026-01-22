'use client';

export interface TicketCardProps {
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
  actions?: React.ReactNode;
}

export default function TicketCard({
  id,
  ticketType,
  status,
  ticketPrice,
  amountPaid,
  createdAt,
  order,
  actions,
}: TicketCardProps) {
  const price = ticketPrice || amountPaid || 0;
  const receiptId = `AISF-${id.slice(-8).toUpperCase()}`;
  const orderId = order?.id ? `#${order.id.slice(-8).toUpperCase()}` : null;

  return (
    <div className="border-l-4 border-[--cyan] bg-[--bg-light] p-4 rounded-r">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[--navy]">{ticketType} Ticket</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
              {status === 'paid' ? 'Confirmed' : status}
            </span>
          </div>
          <p className="text-sm text-[--text-muted]">Receipt: {receiptId}</p>
          {orderId && (
            <p className="text-xs text-[--text-muted] mt-1">Order {orderId}</p>
          )}
          <p className="text-xs text-[--text-muted] mt-1">
            ${(price / 100).toFixed(2)} AUD • {new Date(createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        {actions && (
          <div className="ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
