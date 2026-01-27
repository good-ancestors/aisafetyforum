'use client';

interface PaymentMethodSelectorProps {
  paymentMethod: 'card' | 'invoice';
  onPaymentMethodChange: (method: 'card' | 'invoice') => void;
  purchaserEmail: string;
  orgABN: string;
  onOrgABNChange: (value: string) => void;
  poNumber: string;
  onPoNumberChange: (value: string) => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  purchaserEmail,
  orgABN,
  onOrgABNChange,
  poNumber,
  onPoNumberChange,
}: PaymentMethodSelectorProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-border">
        Payment Method
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'card'
                ? 'border-cyan bg-cyan/5'
                : 'border-border hover:border-grey'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'card' | 'invoice')}
              className="w-4 h-4 text-cyan focus:ring-cyan"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-bold text-navy">Pay by Card</span>
              </div>
              <p className="text-sm text-muted mt-1">
                Pay now via Stripe
              </p>
            </div>
          </label>

          <label
            className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'invoice'
                ? 'border-cyan bg-cyan/5'
                : 'border-border hover:border-grey'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="invoice"
              checked={paymentMethod === 'invoice'}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'card' | 'invoice')}
              className="w-4 h-4 text-cyan focus:ring-cyan"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-bold text-navy">Request Invoice</span>
              </div>
              <p className="text-sm text-muted mt-1">
                Tax invoice with 14 days to pay
              </p>
            </div>
          </label>
        </div>

        {paymentMethod === 'invoice' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="text-sm text-muted">
              We&apos;ll email a PDF tax invoice with GST breakdown and bank transfer details to <strong>{purchaserEmail || 'your email'}</strong>.
              Payment is due within 14 days. Tickets will be confirmed once payment is received.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="orgABN" className="block text-sm font-medium text-navy mb-1">
                  ABN (optional)
                </label>
                <input
                  type="text"
                  id="orgABN"
                  value={orgABN}
                  onChange={(e) => onOrgABNChange(e.target.value)}
                  placeholder="e.g., 12 345 678 901"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="poNumber" className="block text-sm font-medium text-navy mb-1">
                  PO Number (optional)
                </label>
                <input
                  type="text"
                  id="poNumber"
                  value={poNumber}
                  onChange={(e) => onPoNumberChange(e.target.value)}
                  placeholder="Your purchase order number"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
