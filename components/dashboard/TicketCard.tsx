'use client';

import Link from 'next/link';

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
  variant?: 'compact' | 'full';
  actions?: React.ReactNode;
}

export default function TicketCard({
  id,
  ticketType,
  name,
  status,
  ticketPrice,
  amountPaid,
  createdAt,
  order,
  variant = 'full',
  actions,
}: TicketCardProps) {
  const price = ticketPrice || amountPaid || 0;
  const receiptId = `AISF-${id.slice(-8).toUpperCase()}`;
  const orderId = order?.id ? `#${order.id.slice(-8).toUpperCase()}` : null;

  if (variant === 'compact') {
    return (
      <div className="border-l-4 border-[--cyan] bg-[--bg-light] p-4 rounded-r">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{ticketType}</p>
            <p className="text-sm text-[--text-muted]">Receipt: {receiptId}</p>
          </div>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-[--cyan] bg-[--bg-light] p-4 rounded-r">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[--navy]">{ticketType} Ticket</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
              Confirmed
            </span>
          </div>
          <p className="text-sm text-[--text-muted]">Receipt: {receiptId}</p>
          {orderId && (
            <p className="text-xs text-[--text-muted] mt-1">Order {orderId}</p>
          )}
        </div>
        <div className="text-right flex items-start gap-4">
          <div>
            <p className="text-sm font-medium text-[--navy]">
              ${(price / 100).toFixed(2)} AUD
            </p>
            <p className="text-xs text-[--text-muted]">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
