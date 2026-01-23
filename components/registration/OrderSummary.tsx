'use client';

interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  total: number;
  freeTicketCount: number;
}

interface OrderSummaryProps {
  totals: OrderTotals;
  ticketCount: number;
}

export default function OrderSummary({ totals, ticketCount }: OrderSummaryProps) {
  return (
    <section className="bg-[#f0f4f8] rounded-lg p-6">
      <h2 className="text-lg font-bold text-[#0a1f5c] mb-4">Order Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#5c6670]">Subtotal ({ticketCount} ticket{ticketCount !== 1 ? 's' : ''})</span>
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
            <span>Discount</span>
            <span>-${(totals.discountAmount / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-[#0a1f5c] pt-2 border-t border-[#e0e4e8]">
          <span>Total</span>
          <span>${(totals.total / 100).toFixed(2)} AUD</span>
        </div>
        <p className="text-xs text-[#5c6670]">All prices include GST (10%)</p>
      </div>
    </section>
  );
}
