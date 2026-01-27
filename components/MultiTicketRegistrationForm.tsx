'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AttendeeCard, OrderSummary, PaymentMethodSelector, type AttendeeFormData } from '@/components/registration';
import { validateCoupon } from '@/lib/coupon-actions';
import { checkFreeTicketEmail } from '@/lib/free-ticket-actions';
import { createMultiTicketCheckout, createInvoiceOrder, type MultiTicketFormData } from '@/lib/registration-actions';
import { ticketTiers, isEarlyBirdActive, earlyBirdDeadline, type TicketTierId } from '@/lib/stripe-config';

interface InitialProfile {
  email: string;
  name: string;
  role: string;
  organisation: string;
}

interface MultiTicketRegistrationFormProps {
  initialProfile?: InitialProfile;
}

export default function MultiTicketRegistrationForm({ initialProfile }: MultiTicketRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Purchaser info (defaults to first attendee, prefilled from profile if available)
  const [purchaserEmail, setPurchaserEmail] = useState(initialProfile?.email || '');
  const [purchaserName, setPurchaserName] = useState(initialProfile?.name || '');
  const [purchaserRole, setPurchaserRole] = useState(initialProfile?.role || '');
  const [purchaserOrg, setPurchaserOrg] = useState(initialProfile?.organisation || '');
  const [purchaserIsAttendee, setPurchaserIsAttendee] = useState(true);
  const [purchaserFreeTicket, setPurchaserFreeTicket] = useState<string | null>(null);

  // Attendees list (prefilled with profile data if available)
  const [attendees, setAttendees] = useState<AttendeeFormData[]>([
    {
      email: initialProfile?.email || '',
      name: initialProfile?.name || '',
      role: initialProfile?.role || '',
      organisation: initialProfile?.organisation || '',
      ticketType: '',
      freeTicketReason: null,
    },
  ]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState<{
    type: 'percentage' | 'fixed' | 'free';
    value: number;
    description?: string;
  } | null>(null);

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

  // Check if an email qualifies for free ticket
  async function checkEmailForFreeTicket(email: string): Promise<string | null> {
    if (!email || !email.includes('@')) return null;
    const result = await checkFreeTicketEmail(email);
    return result.isFree ? (result.reason || 'Complimentary registration') : null;
  }

  // Handle purchaser email change with free ticket check
  async function handlePurchaserEmailChange(value: string) {
    setPurchaserEmail(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], email: value }, ...prev.slice(1)]);
    }
  }

  async function handlePurchaserEmailBlur() {
    const reason = await checkEmailForFreeTicket(purchaserEmail);
    setPurchaserFreeTicket(reason);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], freeTicketReason: reason }, ...prev.slice(1)]);
    }
  }

  // Handle attendee email blur for free ticket check
  async function handleAttendeeEmailBlur(index: number) {
    const email = index === 0 && purchaserIsAttendee ? purchaserEmail : attendees[index].email;
    const reason = await checkEmailForFreeTicket(email);
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, freeTicketReason: reason } : a))
    );
    if (index === 0 && purchaserIsAttendee) {
      setPurchaserFreeTicket(reason);
    }
  }

  // Calculate total considering free tickets
  const calculateTotal = () => {
    let subtotal = 0;
    let freeTicketCount = 0;

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const hasFreeTicket = i === 0 && purchaserIsAttendee ? purchaserFreeTicket : attendee.freeTicketReason;

      if (attendee.ticketType) {
        const tier = ticketTiers.find((t) => t.id === attendee.ticketType);
        if (tier) {
          if (hasFreeTicket) {
            freeTicketCount++;
          } else {
            subtotal += earlyBird ? tier.earlyBirdPrice : tier.price;
          }
        }
      }
    }

    let discountAmount = 0;
    if (couponApplied && discount && subtotal > 0) {
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
      freeTicketCount,
    };
  };

  const totals = calculateTotal();

  // Compute validation errors for submit button
  const getValidationErrors = () => {
    const errors: string[] = [];

    if (!purchaserEmail) {
      errors.push('Enter your email address');
    }
    if (!purchaserName) {
      errors.push('Enter your name');
    }

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const isFirstAndPurchaser = i === 0 && purchaserIsAttendee;
      const email = isFirstAndPurchaser ? purchaserEmail : attendee.email;
      const name = isFirstAndPurchaser ? purchaserName : attendee.name;

      if (!isFirstAndPurchaser) {
        if (!email) {
          errors.push(`Enter email for attendee ${i + 1}`);
        }
        if (!name) {
          errors.push(`Enter name for attendee ${i + 1}`);
        }
      }

      if (!attendee.ticketType) {
        errors.push(`Select ticket type for attendee ${i + 1}`);
      }
    }

    return errors;
  };

  const validationErrors = getValidationErrors();
  const isFormValid = validationErrors.length === 0;

  const handlePurchaserNameChange = (value: string) => {
    setPurchaserName(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], name: value }, ...prev.slice(1)]);
    }
  };

  const handlePurchaserRoleChange = (value: string) => {
    setPurchaserRole(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], role: value }, ...prev.slice(1)]);
    }
  };

  const handlePurchaserOrgChange = (value: string) => {
    setPurchaserOrg(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], organisation: value }, ...prev.slice(1)]);
    }
  };

  const handlePurchaserIsAttendeeChange = (checked: boolean) => {
    setPurchaserIsAttendee(checked);
    if (checked) {
      // Copy purchaser info to first attendee
      setAttendees((prev) => [
        { ...prev[0], email: purchaserEmail, name: purchaserName, role: purchaserRole, organisation: purchaserOrg, freeTicketReason: purchaserFreeTicket },
        ...prev.slice(1),
      ]);
    } else {
      // Clear first attendee info
      setAttendees((prev) => [{ email: '', name: '', role: '', organisation: '', ticketType: prev[0].ticketType, freeTicketReason: null }, ...prev.slice(1)]);
    }
  };

  const addAttendee = () => {
    setAttendees((prev) => [...prev, { email: '', name: '', role: '', organisation: purchaserOrg, ticketType: '', freeTicketReason: null }]);
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
      ? [{ email: purchaserEmail, name: purchaserName, role: purchaserRole, organisation: purchaserOrg, ticketType: attendees[0].ticketType }, ...attendees.slice(1)]
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
      purchaserRole: purchaserRole || undefined,
      purchaserOrg: purchaserOrg || undefined,
      attendees: effectiveAttendees.map((a) => ({
        email: a.email,
        name: a.name,
        role: a.role || undefined,
        organisation: a.organisation || undefined,
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
                onBlur={handlePurchaserEmailBlur}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchaserRole" className="block text-sm font-bold text-[#0a1f5c] mb-2">
                  Role / Title
                </label>
                <input
                  type="text"
                  id="purchaserRole"
                  value={purchaserRole}
                  onChange={(e) => handlePurchaserRoleChange(e.target.value)}
                  placeholder="e.g., Research Scientist"
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
                  onChange={(e) => handlePurchaserOrgChange(e.target.value)}
                  placeholder="Your organisation"
                  className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
                />
              </div>
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
          <h2 className="text-lg font-bold text-[#0a1f5c] mb-4 pb-2 border-b border-[#e0e4e8]">
            Attendees ({attendees.length} ticket{attendees.length !== 1 ? 's' : ''})
          </h2>

          <div className="space-y-6">
            {attendees.map((attendee, index) => (
              <AttendeeCard
                key={index}
                index={index}
                attendee={attendee}
                isPurchaserAttendee={purchaserIsAttendee}
                purchaserEmail={purchaserEmail}
                purchaserName={purchaserName}
                purchaserRole={purchaserRole}
                purchaserOrg={purchaserOrg}
                purchaserFreeTicket={purchaserFreeTicket}
                totalAttendees={attendees.length}
                onUpdateAttendee={updateAttendee}
                onRemoveAttendee={removeAttendee}
                onEmailBlur={handleAttendeeEmailBlur}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addAttendee}
            className="mt-4 w-full py-3 text-sm font-bold text-[#0047ba] hover:text-[#0a1f5c] border border-dashed border-[#0047ba] hover:border-[#0a1f5c] rounded-md flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Attendee
          </button>
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
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            purchaserEmail={purchaserEmail}
            orgABN={orgABN}
            onOrgABNChange={setOrgABN}
            poNumber={poNumber}
            onPoNumberChange={setPoNumber}
          />
        )}

        {/* Order Summary */}
        <OrderSummary totals={totals} ticketCount={attendees.length} />

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
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
          {!isFormValid && !isSubmitting && (
            <p className="text-sm text-[#5c6670] mt-3 text-center">
              {validationErrors[0]}
            </p>
          )}
          {totals.total > 0 && isFormValid && (
            <p className="text-sm text-[#5c6670] mt-4 text-center">
              {paymentMethod === 'invoice'
                ? 'Invoice will be sent via email'
                : 'Secure checkout powered by Stripe'}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
