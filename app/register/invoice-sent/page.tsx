import Link from 'next/link';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { eventConfig } from '@/lib/config';
import { calculateGST } from '@/lib/invoice-pdf';
import { getOrderById } from '@/lib/registration-actions';
import InvoiceDownloadButton from './InvoiceDownloadButton';

export default async function InvoiceSentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; invoice_url?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id;

  if (!orderId) {
    return (
      <>
        <Header />
        <main className="bg-cream py-16 px-8 min-h-[60vh]">
          <div className="max-w-[600px] mx-auto text-center">
            <h1 className="font-serif text-2xl font-bold text-navy mb-4">
              Order Not Found
            </h1>
            <p className="text-muted mb-8">
              We couldn&apos;t find your order. Please contact us if you need assistance.
            </p>
            <Link
              href="/register"
              className="inline-block bg-navy text-white px-6 py-3 rounded hover:bg-navy-light transition-colors"
            >
              Back to Registration
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <>
        <Header />
        <main className="bg-cream py-16 px-8 min-h-[60vh]">
          <div className="max-w-[600px] mx-auto text-center">
            <h1 className="font-serif text-2xl font-bold text-navy mb-4">
              Order Not Found
            </h1>
            <p className="text-muted mb-8">
              We couldn&apos;t find your order. Please contact us if you need assistance.
            </p>
            <Link
              href="/register"
              className="inline-block bg-navy text-white px-6 py-3 rounded hover:bg-navy-light transition-colors"
            >
              Back to Registration
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const bankDetails = eventConfig.organization.bankDetails;
  const organization = eventConfig.organization;
  const invoiceNumber = order.invoiceNumber || `AISF-${order.id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dueDate = order.invoiceDueDate
    ? new Date(order.invoiceDueDate).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Within 14 days';

  // Calculate GST (1/11th of total, as GST is included)
  const gstAmount = calculateGST(order.totalAmount);
  const subtotalExGST = order.totalAmount - gstAmount;

  return (
    <>
      <Header />
      <main className="bg-cream py-16 px-8">
        <div className="max-w-[850px] mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy mb-4">
              Invoice Created!
            </h1>
            <p className="text-lg text-body">
              We&apos;ve emailed your tax invoice to <strong>{order.purchaserEmail}</strong>
            </p>
          </div>

          {/* Download Button */}
          <div className="text-center mb-8">
            <InvoiceDownloadButton orderId={orderId} invoiceNumber={invoiceNumber} />
          </div>

          {/* Invoice Preview */}
          <div className="bg-white rounded-lg border-2 border-navy shadow-lg mb-8">
            {/* Invoice Header */}
            <div className="p-8 border-b-2 border-navy">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-1">TAX INVOICE</h2>
                  <p className="text-muted">Australian AI Safety Forum {eventConfig.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy">{invoiceNumber}</p>
                  <p className="text-sm text-muted">Date: {invoiceDate}</p>
                  <p className="text-sm text-muted">Due: {dueDate}</p>
                </div>
              </div>
            </div>

            {/* From / To */}
            <div className="p-8 grid grid-cols-2 gap-8 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-navy mb-2 border-b border-border pb-1">From</h3>
                <p className="font-bold text-sm">{organization.name}</p>
                <p className="text-sm text-muted">ABN: {organization.abn}</p>
                <p className="text-sm text-muted">{organization.address.line1}</p>
                <p className="text-sm text-muted">{organization.address.line2}</p>
                <p className="text-sm text-muted">{organization.address.city} {organization.address.postcode}</p>
                <p className="text-sm text-muted">{organization.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy mb-2 border-b border-border pb-1">Bill To</h3>
                <p className="font-bold text-sm">{order.purchaserName}</p>
                {order.orgName && <p className="text-sm text-muted">{order.orgName}</p>}
                {order.orgABN && <p className="text-sm text-muted">ABN: {order.orgABN}</p>}
                <p className="text-sm text-muted">{order.purchaserEmail}</p>
                {order.poNumber && <p className="text-sm text-muted mt-2">PO Number: {order.poNumber}</p>}
              </div>
            </div>

            {/* Event Info */}
            <div className="px-8 py-4 bg-light border-b border-border">
              <p className="text-sm">
                <span className="font-bold text-navy">Event:</span>{' '}
                <span className="text-body">Australian AI Safety Forum {eventConfig.year}</span>
              </p>
              <p className="text-sm">
                <span className="font-bold text-navy">Date:</span>{' '}
                <span className="text-body">{eventConfig.datesLong}</span>
              </p>
              <p className="text-sm">
                <span className="font-bold text-navy">Location:</span>{' '}
                <span className="text-body">{eventConfig.venueLong}</span>
              </p>
            </div>

            {/* Line Items Table */}
            <div className="p-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-navy">
                    <th className="text-left py-2 font-bold text-navy">Description</th>
                    <th className="text-right py-2 font-bold text-navy">Qty</th>
                    <th className="text-right py-2 font-bold text-navy">Unit Price</th>
                    <th className="text-right py-2 font-bold text-navy">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-border">
                      <td className="py-3">
                        <p className="font-medium">{reg.ticketType}</p>
                        <p className="text-muted">{reg.name}</p>
                      </td>
                      <td className="py-3 text-right">1</td>
                      <td className="py-3 text-right">${(reg.originalAmount / 100).toFixed(2)}</td>
                      <td className="py-3 text-right">${(reg.originalAmount / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 border-t-2 border-navy pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    {order.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${((order.totalAmount + order.discountAmount) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${(order.discountAmount / 100).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Subtotal (ex GST)</span>
                      <span>${(subtotalExGST / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (10%)</span>
                      <span>${(gstAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-navy pt-2 mt-2">
                      <span>Total AUD</span>
                      <span>${(order.totalAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="px-8 py-6 bg-info-bg border-t-2 border-cyan">
              <h3 className="font-bold text-navy mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted">Account Name</p>
                  <p className="font-medium">{bankDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-muted">Bank</p>
                  <p className="font-medium">{bankDetails.bank}</p>
                </div>
                <div>
                  <p className="text-muted">BSB</p>
                  <p className="font-medium font-mono">{bankDetails.bsb}</p>
                </div>
                <div>
                  <p className="text-muted">Account Number</p>
                  <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/50 rounded">
                <p className="text-muted text-sm">Payment Reference</p>
                <p className="font-bold text-navy font-mono">{invoiceNumber}</p>
                <p className="text-xs text-muted mt-1">Please use this reference so we can identify your payment</p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <h2 className="font-bold text-navy mb-3">What happens next?</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-body">
              <li>Transfer the amount to the bank account shown above</li>
              <li>Use the payment reference <strong>{invoiceNumber}</strong> so we can identify your payment</li>
              <li>Your tickets will be confirmed once payment is received</li>
              <li>Each attendee will receive a confirmation email</li>
            </ol>
          </div>

          {/* Contact Info */}
          <div className="text-center text-sm text-muted">
            <p className="mb-2">
              Questions?{' '}
              <a href="/contact" className="text-brand-blue underline">
                Contact us
              </a>
            </p>
            <p>
              <Link href="/" className="text-brand-blue underline">
                Return to homepage
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
