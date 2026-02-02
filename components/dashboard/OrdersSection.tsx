'use client';

import Link from 'next/link';
import CancelOrderButton from '@/app/dashboard/tickets/CancelOrderButton';
import InvoiceButton from '@/app/dashboard/tickets/InvoiceButton';
import ReceiptButton from '@/app/dashboard/tickets/ReceiptButton';
import OrderCard from './OrderCard';

interface OrderRegistration {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  profile?: {
    id: string;
    name: string | null;
  } | null;
}

interface Order {
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
}

interface OrdersSectionProps {
  orders: Order[];
  maxItems?: number;
  showViewAllLink?: boolean;
  variant?: 'default' | 'pending';
  title?: string;
  description?: string;
}

export default function OrdersSection({
  orders,
  maxItems,
  showViewAllLink = false,
  variant = 'default',
  title = "Orders You've Purchased",
  description = 'Group tickets and orders purchased by you',
}: OrdersSectionProps) {
  const displayedOrders = maxItems ? orders.slice(0, maxItems) : orders;
  const remainingCount = maxItems ? orders.length - maxItems : 0;

  if (orders.length === 0) {
    return null;
  }

  const isPending = variant === 'pending';
  const borderClass = isPending ? 'border-amber-300' : 'border-border';

  return (
    <section className={`bg-white rounded-lg border ${borderClass} p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-navy">{title}</h2>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        {showViewAllLink && (
          <Link href="/dashboard/tickets" className="text-sm text-blue hover:underline">
            View All
          </Link>
        )}
      </div>
      <div className="space-y-6">
        {displayedOrders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            totalAmount={order.totalAmount}
            paymentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
            createdAt={order.createdAt}
            registrations={order.registrations}
            invoiceNumber={order.invoiceNumber}
            invoiceDueDate={order.invoiceDueDate}
            orgName={order.orgName}
            orgABN={order.orgABN}
            actions={
              <>
                {order.paymentMethod === 'invoice' ? (
                  <InvoiceButton orderId={order.id} invoiceNumber={order.invoiceNumber ?? null} />
                ) : (
                  <ReceiptButton orderId={order.id} />
                )}
                <CancelOrderButton
                  orderId={order.id}
                  ticketCount={order.registrations.length}
                  totalAmount={order.totalAmount}
                  paymentMethod={order.paymentMethod}
                  paymentStatus={order.paymentStatus}
                />
              </>
            }
          />
        ))}
        {remainingCount > 0 && (
          <p className="text-sm text-muted">+ {remainingCount} more order(s)</p>
        )}
      </div>
    </section>
  );
}
