import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getOrderById } from '@/lib/registration-actions';
import { eventConfig } from '@/lib/config';

export default async function InvoiceSentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id;

  if (!orderId) {
    return (
      <>
        <Header />
        <main className="bg-[#f9fafb] py-16 px-8 min-h-[60vh]">
          <div className="max-w-[600px] mx-auto text-center">
            <h1 className="font-serif text-2xl font-bold text-[#0a1f5c] mb-4">
              Order Not Found
            </h1>
            <p className="text-[#5c6670] mb-8">
              We couldn&apos;t find your order. Please contact us if you need assistance.
            </p>
            <Link
              href="/register"
              className="inline-block bg-[#0a1f5c] text-white px-6 py-3 rounded hover:bg-[#1a3a8f] transition-colors"
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
        <main className="bg-[#f9fafb] py-16 px-8 min-h-[60vh]">
          <div className="max-w-[600px] mx-auto text-center">
            <h1 className="font-serif text-2xl font-bold text-[#0a1f5c] mb-4">
              Order Not Found
            </h1>
            <p className="text-[#5c6670] mb-8">
              We couldn&apos;t find your order. Please contact us if you need assistance.
            </p>
            <Link
              href="/register"
              className="inline-block bg-[#0a1f5c] text-white px-6 py-3 rounded hover:bg-[#1a3a8f] transition-colors"
            >
              Back to Registration
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-[#f9fafb] py-16 px-8">
        <div className="max-w-[700px] mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#0a1f5c] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#0a1f5c] mb-4">
              Invoice Sent!
            </h1>
            <p className="text-lg text-[#333333]">
              We&apos;ve sent an invoice to <strong>{order.purchaserEmail}</strong>
            </p>
          </div>

          {/* Invoice Info Card */}
          <div className="bg-white rounded-lg border border-[#e0e4e8] p-8 mb-8">
            <div className="border-l-4 border-[#0047ba] bg-[#f0f4f8] rounded-r-lg p-4 mb-6">
              <h2 className="font-bold text-[#0a1f5c] mb-2">What happens next?</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-[#333333]">
                <li>Check your email for the invoice from Stripe</li>
                <li>Pay via bank transfer using the details in the invoice</li>
                <li>Your tickets will be confirmed once payment is received</li>
                <li>Each attendee will receive a confirmation email</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-[#5c6670]">Order Reference</span>
                <p className="font-medium">AISF-{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <span className="text-[#5c6670]">Payment Due</span>
                <p className="font-medium">Within 14 days</p>
              </div>
              <div>
                <span className="text-[#5c6670]">Total Amount</span>
                <p className="font-medium">${(order.totalAmount / 100).toFixed(2)} AUD</p>
              </div>
              <div>
                <span className="text-[#5c6670]">Tickets</span>
                <p className="font-medium">{order.registrations.length} attendee{order.registrations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {order.poNumber && (
              <div className="text-sm mb-6">
                <span className="text-[#5c6670]">PO Number</span>
                <p className="font-medium">{order.poNumber}</p>
              </div>
            )}

            {/* Attendees List */}
            <div className="border-t border-[#e0e4e8] pt-6">
              <h3 className="font-bold text-[#0a1f5c] mb-4">Registered Attendees</h3>
              <div className="space-y-3">
                {order.registrations.map((reg, index) => (
                  <div key={reg.id} className="flex justify-between items-center text-sm bg-[#f9fafb] p-3 rounded">
                    <div>
                      <span className="font-medium">{reg.name}</span>
                      <span className="text-[#5c6670] ml-2">({reg.email})</span>
                    </div>
                    <span className="text-[#5c6670]">{reg.ticketType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-gradient-to-r from-[#0a1f5c] to-[#0047ba] text-white rounded-lg p-6 mb-8">
            <h3 className="font-serif text-xl font-bold mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">Dates</p>
                <p className="font-medium">{eventConfig.datesLong}</p>
              </div>
              <div>
                <p className="text-white/70">Time</p>
                <p className="font-medium">{eventConfig.startTime} - {eventConfig.endTime} AEST</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-white/70">Location</p>
                <p className="font-medium">{eventConfig.venueLong}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center text-sm text-[#5c6670]">
            <p className="mb-2">
              Questions? Contact us at{' '}
              <a href={`mailto:${eventConfig.organization.email}`} className="text-[#0047ba] underline">
                {eventConfig.organization.email}
              </a>
            </p>
            <p>
              <Link href="/" className="text-[#0047ba] underline">
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
