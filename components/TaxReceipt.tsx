'use client';

import { eventConfig } from '@/lib/config';

interface TaxReceiptProps {
  registration: {
    id: string;
    name: string;
    email: string;
    organisation: string | null;
    ticketType: string;
    amountPaid: number;
    createdAt: Date;
    stripePaymentId: string | null;
  };
}

export default function TaxReceipt({ registration }: TaxReceiptProps) {
  // Add print styles
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('tax-receipt-print-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'tax-receipt-print-styles';
      style.textContent = `
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }

          body * {
            visibility: hidden;
          }

          #tax-receipt, #tax-receipt * {
            visibility: visible;
          }

          #tax-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-after: avoid;
          }

          #tax-receipt button {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  const receiptDate = new Date(registration.createdAt).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const receiptNumber = `AISF-${registration.id.slice(-8).toUpperCase()}`;

  return (
    <div id="tax-receipt" className="bg-white border-2 border-[#0a1f5c] rounded-lg p-8 my-8">
      {/* Header */}
      <div className="border-b-2 border-[#0a1f5c] pb-6 mb-6">
        <h2 className="text-2xl font-bold text-[#0a1f5c] mb-2">TAX RECEIPT</h2>
        <div className="text-sm text-[#333333]">
          <p className="font-bold">Receipt Number: {receiptNumber}</p>
          <p>Date: {receiptDate}</p>
        </div>
      </div>

      {/* Organization Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#e0e4e8]">
        <div>
          <h3 className="font-bold text-[#0a1f5c] mb-2">From:</h3>
          <div className="text-sm text-[#333333]">
            <p className="font-bold">{eventConfig.organization.name}</p>
            <p>ABN: {eventConfig.organization.abn}</p>
            <p className="mt-2">{eventConfig.organization.address.line1}</p>
            <p>{eventConfig.organization.address.line2}</p>
            <p>{eventConfig.organization.address.line3}</p>
            <p>
              {eventConfig.organization.address.city} {eventConfig.organization.address.postcode}
            </p>
            <p>{eventConfig.organization.address.country}</p>
            <p className="mt-2">{eventConfig.organization.email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-[#0a1f5c] mb-2">To:</h3>
          <div className="text-sm text-[#333333]">
            <p className="font-bold">{registration.name}</p>
            {registration.organisation && <p>{registration.organisation}</p>}
            <p className="mt-2">{registration.email}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="font-bold text-[#0a1f5c] mb-3">Payment Details:</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e0e4e8]">
              <th className="text-left py-2 text-[#0a1f5c]">Description</th>
              <th className="text-right py-2 text-[#0a1f5c]">Amount (AUD)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e0e4e8]">
              <td className="py-3 text-[#333333]">
                <div>
                  <p className="font-medium">
                    Australian AI Safety Forum {eventConfig.year} - {registration.ticketType}
                  </p>
                  <p className="text-xs text-[#5c6670] mt-1">{eventConfig.datesLong}</p>
                  <p className="text-xs text-[#5c6670]">{eventConfig.venueLong}</p>
                </div>
              </td>
              <td className="py-3 text-right text-[#333333]">
                ${(registration.amountPaid / 100).toFixed(2)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-4 text-right font-bold text-[#0a1f5c]">Total (inc. GST):</td>
              <td className="py-4 text-right font-bold text-[#0a1f5c] text-lg">
                ${(registration.amountPaid / 100).toFixed(2)}
              </td>
            </tr>
            <tr className="text-xs text-[#5c6670]">
              <td className="py-1 text-right">GST (10%):</td>
              <td className="py-1 text-right">
                ${((registration.amountPaid / 100) * 0.1).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment Method */}
      {registration.stripePaymentId && (
        <div className="text-xs text-[#5c6670] mb-6">
          <p>Payment Method: Credit Card via Stripe</p>
          <p>Transaction ID: {registration.stripePaymentId}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-[#e0e4e8] text-xs text-[#5c6670]">
        <p className="mb-2">
          This is a tax receipt for payment received. Please retain for your records.
        </p>
        <p>
          For enquiries regarding this receipt, please contact{' '}
          <a
            href={`mailto:${eventConfig.organization.email}`}
            className="text-[#0047ba] hover:underline"
          >
            {eventConfig.organization.email}
          </a>
        </p>
      </div>

      {/* Print Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-[#0a1f5c] text-white rounded-md hover:bg-[#1a3a8f] transition-colors text-sm font-medium"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
