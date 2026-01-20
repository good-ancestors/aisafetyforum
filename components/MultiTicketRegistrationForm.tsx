'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMultiTicketCheckout, createInvoiceOrder, type MultiTicketFormData, type AttendeeData } from '@/lib/registration-actions';
import { validateCoupon } from '@/lib/coupon-actions';
import { ticketTiers, isEarlyBirdActive, earlyBirdDeadline, type TicketTierId } from '@/lib/stripe-config';

type AttendeeFormData = {
  email: string;
  name: string;
  ticketType: TicketTierId | '';
};

export default function MultiTicketRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Purchaser info (defaults to first attendee)
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserOrg, setPurchaserOrg] = useState('');
  const [purchaserIsAttendee, setPurchaserIsAttendee] = useState(true);

  // Attendees list
  const [attendees, setAttendees] = useState<AttendeeFormData[]>([
    { email: '', name: '', ticketType: '' },
  ]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState<any>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  const [orgABN, setOrgABN] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const earlyBird = isEarlyBirdActive();
  const deadlineDate = new Date(earlyBirdDeadline).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate total
  const calculateTotal = () => {
    let subtotal = 0;
    const validAttendees = purchaserIsAttendee
      ? [{ ...attendees[0], email: purchaserEmail, name: purchaserName }, ...attendees.slice(1)]
      : attendees;

    for (const attendee of validAttendees) {
      if (attendee.ticketType) {
        const tier = ticketTiers.find((t) => t.id === attendee.ticketType);
        if (tier) {
          subtotal += earlyBird ? tier.earlyBirdPrice : tier.price;
        }
      }
    }

    let discountAmount = 0;
    if (couponApplied && discount) {
      if (discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free') {
        discountAmount = subtotal;
      }
    }

    return {
      subtotal,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
    };
  };

  const totals = calculateTotal();

  // Sync purchaser info with first attendee if purchaser is attendee
  const handlePurchaserEmailChange = (value: string) => {
    setPurchaserEmail(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], email: value }, ...prev.slice(1)]);
    }
  };

  const handlePurchaserNameChange = (value: string) => {
    setPurchaserName(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], name: value }, ...prev.slice(1)]);
    }
  };

  const handlePurchaserIsAttendeeChange = (checked: boolean) => {
    setPurchaserIsAttendee(checked);
    if (checked) {
      // Copy purchaser info to first attendee
      setAttendees((prev) => [
        { ...prev[0], email: purchaserEmail, name: purchaserName },
        ...prev.slice(1),
      ]);
    } else {
      // Clear first attendee info
      setAttendees((prev) => [{ email: '', name: '', ticketType: prev[0].ticketType }, ...prev.slice(1)]);
    }
  };

  const addAttendee = () => {
    setAttendees((prev) => [...prev, { email: '', name: '', ticketType: '' }]);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      setAttendees((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index: number, field: keyof AttendeeFormData, value: string) => {
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setError(null);

    // Validate against first attendee's ticket type
    const firstTicketType = attendees[0].ticketType || 'standard';
    const result = await validateCoupon(couponCode, purchaserEmail, firstTicketType as TicketTierId);

    if (result.valid && result.discount) {
      setCouponApplied(true);
      setDiscount(result.discount);
      setError(null);
    } else {
      setCouponApplied(false);
      setDiscount(null);
      setError(result.error || 'Invalid coupon code');
    }

    setValidatingCoupon(false);
  }

  function handleRemoveCoupon() {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate all attendees have required fields
    const effectiveAttendees = purchaserIsAttendee
      ? [{ email: purchaserEmail, name: purchaserName, ticketType: attendees[0].ticketType }, ...attendees.slice(1)]
      : attendees;

    for (let i = 0; i < effectiveAttendees.length; i++) {
      const a = effectiveAttendees[i];
      if (!a.email || !a.name || !a.ticketType) {
        setError(`Please fill in all required fields for attendee ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const formData: MultiTicketFormData = {
      purchaserEmail,
      purchaserName,
      purchaserOrg: purchaserOrg || undefined,
      attendees: effectiveAttendees.map((a) => ({
        email: a.email,
        name: a.name,
        ticketType: a.ticketType as TicketTierId,
      })),
      couponCode: couponApplied ? couponCode : undefined,
    };

    if (paymentMethod === 'invoice') {
      // Create invoice order
      const result = await createInvoiceOrder({
        ...formData,
        orgName: purchaserOrg || undefined,
        orgABN: orgABN || undefined,
        poNumber: poNumber || undefined,
      });

      if (result.success) {
        router.push(`/register/invoice-sent?order_id=${result.orderId}`);
      } else {
        setError(result.error || 'An error occurred');
        setIsSubmitting(false);
      }
    } else {
      // Card payment via Stripe Checkout
      const result = await createMultiTicketCheckout(formData);

      if (result.success) {
        if (result.free) {
          router.push(`/register/success?order_id=${result.orderId}`);
        } else if (result.url) {
          window.location.href = result.url;
        }
      } else {
        setError(result.error || 'An error occurred');
        setIsSubmitting(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-[#e0e4e8]">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Early Bird Banner */}
        {earlyBird && (
          <div className="bg-gradient-to-r from-[#0a1f5c] to-[#0047ba] text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Early Bird Pricing — 40% Off!</p>
                <p className="text-sm opacity-90">Register before {deadlineDate} to save</p>
              </div>
            </div>
          </div>
        )}

        {/* Purchaser Section */}
        <section>
          <h2 className="text-lg font-bold text-[#0a1f5c] mb-4 pb-2 border-b border-[#e0e4e8]">
            Your Details (Purchaser)
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="purchaserEmail" className="block text-sm font-bold text-[#0a1f5c] mb-2">
                Email *
              </label>
              <input
                type="email"
                id="purchaserEmail"
                required
                value={purchaserEmail}
                onChange={(e) => handlePurchaserEmailChange(e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="purchaserName" className="block text-sm font-bold text-[#0a1f5c] mb-2">
                Name *
              </label>
              <input
                type="text"
                id="purchaserName"
                required
                value={purchaserName}
                onChange={(e) => handlePurchaserNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="purchaserOrg" className="block text-sm font-bold text-[#0a1f5c] mb-2">
                Organisation
              </label>
              <input
                type="text"
                id="purchaserOrg"
                value={purchaserOrg}
                onChange={(e) => setPurchaserOrg(e.target.value)}
                placeholder="Optional — for invoice purposes"
                className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3 bg-[#f0f4f8] p-3 rounded-md">
              <input
                type="checkbox"
                id="purchaserIsAttendee"
                checked={purchaserIsAttendee}
                onChange={(e) => handlePurchaserIsAttendeeChange(e.target.checked)}
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] rounded focus:ring-[#00d4ff]"
              />
              <label htmlFor="purchaserIsAttendee" className="text-sm text-[#333333]">
                I am also attending (use my details for the first ticket)
              </label>
            </div>
          </div>
        </section>

        {/* Attendees Section */}
        <section>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e0e4e8]">
            <h2 className="text-lg font-bold text-[#0a1f5c]">
              Attendees ({attendees.length} ticket{attendees.length !== 1 ? 's' : ''})
            </h2>
            <button
              type="button"
              onClick={addAttendee}
              className="text-sm font-bold text-[#0047ba] hover:text-[#0a1f5c] flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Attendee
            </button>
          </div>

          <div className="space-y-6">
            {attendees.map((attendee, index) => (
              <div
                key={index}
                className="border border-[#e0e4e8] rounded-lg p-4 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-[#0a1f5c]">
                    Attendee {index + 1}
                    {index === 0 && purchaserIsAttendee && (
                      <span className="ml-2 text-xs font-normal text-[#5c6670]">(You)</span>
                    )}
                  </h3>
                  {attendees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttendee(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={index === 0 && purchaserIsAttendee ? purchaserEmail : attendee.email}
                      onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                      disabled={index === 0 && purchaserIsAttendee}
                      className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={index === 0 && purchaserIsAttendee ? purchaserName : attendee.name}
                      onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                      disabled={index === 0 && purchaserIsAttendee}
                      className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                      Ticket Type *
                    </label>
                    <select
                      required
                      value={attendee.ticketType}
                      onChange={(e) => updateAttendee(index, 'ticketType', e.target.value)}
                      className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                    >
                      <option value="">Select ticket type</option>
                      {ticketTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name} — {earlyBird ? tier.earlyBirdPriceDisplay : tier.priceDisplay}
                          {earlyBird && ` (was ${tier.priceDisplay})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coupon Code */}
        <section>
          <h2 className="text-lg font-bold text-[#0a1f5c] mb-4 pb-2 border-b border-[#e0e4e8]">
            Discount Code
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                if (couponApplied) {
                  setCouponApplied(false);
                  setDiscount(null);
                }
              }}
              disabled={couponApplied}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100 uppercase"
            />
            {!couponApplied ? (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-6 py-2 text-sm font-bold bg-[#0a1f5c] text-white rounded-md hover:bg-[#1a3a8f] transition-colors disabled:opacity-50"
              >
                {validatingCoupon ? 'Checking...' : 'Apply'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="px-6 py-2 text-sm font-bold bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {couponApplied && discount && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="font-bold text-green-800">Discount applied: {discount.description}</p>
              </div>
            </div>
          )}
        </section>

        {/* Payment Method */}
        {totals.total > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#0a1f5c] mb-4 pb-2 border-b border-[#e0e4e8]">
              Payment Method
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#00d4ff] bg-[#00d4ff]/5'
                      : 'border-[#e0e4e8] hover:border-[#a8b0b8]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'invoice')}
                    className="w-4 h-4 text-[#00d4ff] focus:ring-[#00d4ff]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#0a1f5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-bold text-[#0a1f5c]">Pay by Card</span>
                    </div>
                    <p className="text-sm text-[#5c6670] mt-1">
                      Pay now via Stripe
                    </p>
                  </div>
                </label>

                <label
                  className={`relative flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'invoice'
                      ? 'border-[#00d4ff] bg-[#00d4ff]/5'
                      : 'border-[#e0e4e8] hover:border-[#a8b0b8]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="invoice"
                    checked={paymentMethod === 'invoice'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'invoice')}
                    className="w-4 h-4 text-[#00d4ff] focus:ring-[#00d4ff]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#0a1f5c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-bold text-[#0a1f5c]">Pay by Invoice</span>
                    </div>
                    <p className="text-sm text-[#5c6670] mt-1">
                      Bank transfer (14 days)
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'invoice' && (
                <div className="space-y-4 pt-4 border-t border-[#e0e4e8]">
                  <p className="text-sm text-[#5c6670]">
                    We&apos;ll send an invoice to <strong>{purchaserEmail || 'your email'}</strong> with bank transfer details.
                    Payment is due within 14 days. Tickets will be confirmed once payment is received.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="orgABN" className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        ABN (optional)
                      </label>
                      <input
                        type="text"
                        id="orgABN"
                        value={orgABN}
                        onChange={(e) => setOrgABN(e.target.value)}
                        placeholder="e.g., 12 345 678 901"
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="poNumber" className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        PO Number (optional)
                      </label>
                      <input
                        type="text"
                        id="poNumber"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        placeholder="Your purchase order number"
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Order Summary */}
        <section className="bg-[#f0f4f8] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#0a1f5c] mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5c6670]">Subtotal ({attendees.length} ticket{attendees.length !== 1 ? 's' : ''})</span>
              <span className="font-medium">${(totals.subtotal / 100).toFixed(2)}</span>
            </div>
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

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || attendees.some((a) => !a.ticketType)}
            className="w-full px-8 py-4 text-base font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Processing...'
              : totals.total === 0
                ? 'Complete Registration'
                : paymentMethod === 'invoice'
                  ? `Request Invoice — $${(totals.total / 100).toFixed(2)} AUD`
                  : `Pay $${(totals.total / 100).toFixed(2)} AUD`}
          </button>
          {totals.total > 0 && (
            <p className="text-sm text-[#5c6670] mt-4 text-center">
              {paymentMethod === 'invoice'
                ? 'Invoice will be sent via Stripe'
                : 'Secure checkout powered by Stripe'}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
