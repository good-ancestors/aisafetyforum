'use client';

interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  total: number;
  freeTicketCount: number;
}

interface DiscountInfo {
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  description?: string;
}

interface OrderSummaryProps {
  totals: OrderTotals;
  ticketCount: number;
  discount?: DiscountInfo | null;
}

export default function OrderSummary({ totals, ticketCount, discount }: OrderSummaryProps) {
  return (
    <section className="bg-light rounded-lg p-6">
      <h2 className="text-lg font-bold text-navy mb-4">Order Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal ({ticketCount} ticket{ticketCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">${(totals.subtotal / 100).toFixed(2)}</span>
        </div>
        {totals.freeTicketCount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Complimentary tickets ({totals.freeTicketCount})</span>
            <span>$0.00</span>
          </div>
        )}
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>
              {discount?.description || 'Discount'}
              {discount?.type === 'fixed' && (
                <span className="text-xs text-green-500 ml-1">(applied to order)</span>
              )}
            </span>
            <span>-${(totals.discountAmount / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-navy pt-2 border-t border-border">
          <span>Total</span>
          <span>${(totals.total / 100).toFixed(2)} AUD</span>
        </div>
        <p className="text-xs text-muted">All prices include GST (10%)</p>
      </div>
    </section>
  );
}
