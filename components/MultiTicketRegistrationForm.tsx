'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMultiTicketCheckout, createInvoiceOrder, type MultiTicketFormData } from '@/lib/registration-actions';
import { validateCoupon } from '@/lib/coupon-actions';
import { checkFreeTicketEmail } from '@/lib/free-ticket-actions';
import { ticketTiers, isEarlyBirdActive, earlyBirdDeadline, type TicketTierId } from '@/lib/stripe-config';

type AttendeeFormData = {
  email: string;
  name: string;
  role: string;
  organisation: string;
  ticketType: TicketTierId | '';
  freeTicketReason?: string | null;
};

export default function MultiTicketRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Purchaser info (defaults to first attendee)
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserRole, setPurchaserRole] = useState('');
  const [purchaserOrg, setPurchaserOrg] = useState('');
  const [purchaserIsAttendee, setPurchaserIsAttendee] = useState(true);
  const [purchaserFreeTicket, setPurchaserFreeTicket] = useState<string | null>(null);

  // Attendees list
  const [attendees, setAttendees] = useState<AttendeeFormData[]>([
    { email: '', name: '', role: '', organisation: '', ticketType: '', freeTicketReason: null },
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
      const email = i === 0 && purchaserIsAttendee ? purchaserEmail : attendee.email;
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
            {attendees.map((attendee, index) => {
              const email = index === 0 && purchaserIsAttendee ? purchaserEmail : attendee.email;
              const name = index === 0 && purchaserIsAttendee ? purchaserName : attendee.name;
              const role = index === 0 && purchaserIsAttendee ? purchaserRole : attendee.role;
              const organisation = index === 0 && purchaserIsAttendee ? purchaserOrg : attendee.organisation;
              const freeReason = index === 0 && purchaserIsAttendee ? purchaserFreeTicket : attendee.freeTicketReason;

              return (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                        onBlur={() => handleAttendeeEmailBlur(index)}
                        disabled={index === 0 && purchaserIsAttendee}
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                      />
                      {freeReason && (
                        <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Complimentary ticket</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                        disabled={index === 0 && purchaserIsAttendee}
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => updateAttendee(index, 'role', e.target.value)}
                        disabled={index === 0 && purchaserIsAttendee}
                        placeholder="e.g., Research Scientist"
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0a1f5c] mb-1">
                        Organisation
                      </label>
                      <input
                        type="text"
                        value={organisation}
                        onChange={(e) => updateAttendee(index, 'organisation', e.target.value)}
                        disabled={index === 0 && purchaserIsAttendee}
                        placeholder="Your organisation"
                        className="w-full px-3 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Ticket Type - Radio Card Style */}
                  <div>
                    <label className="block text-sm font-medium text-[#0a1f5c] mb-2">
                      Ticket Type *
                    </label>
                    <div className="space-y-2">
                      {ticketTiers.map((tier) => (
                        <label
                          key={tier.id}
                          className={`flex items-center justify-between p-3 border-l-4 ${tier.borderColor} bg-[#f9fafb] rounded cursor-pointer hover:bg-[#f0f4f8] transition-colors ${
                            attendee.ticketType === tier.id ? 'ring-2 ring-[#00d4ff]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`ticketType-${index}`}
                              value={tier.id}
                              checked={attendee.ticketType === tier.id}
                              onChange={(e) => updateAttendee(index, 'ticketType', e.target.value)}
                              className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] focus:ring-[#00d4ff]"
                            />
                            <div>
                              <div className="font-bold text-[#0a1f5c] text-sm">{tier.name}</div>
                              <div className="text-xs text-[#5c6670]">{tier.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            {freeReason ? (
                              <>
                                <div className="text-xs text-[#5c6670] line-through">
                                  {earlyBird ? tier.earlyBirdPriceDisplay : tier.priceDisplay}
                                </div>
                                <div className="font-bold text-green-600">$0.00</div>
                              </>
                            ) : earlyBird ? (
                              <>
                                <div className="text-xs text-[#5c6670] line-through">{tier.priceDisplay}</div>
                                <div className={`font-bold ${tier.textColor}`}>{tier.earlyBirdPriceDisplay}</div>
                              </>
                            ) : (
                              <div className={`font-bold ${tier.textColor}`}>{tier.priceDisplay}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
                      <span className="font-bold text-[#0a1f5c]">Request Invoice</span>
                    </div>
                    <p className="text-sm text-[#5c6670] mt-1">
                      Tax invoice with 14 days to pay
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'invoice' && (
                <div className="space-y-4 pt-4 border-t border-[#e0e4e8]">
                  <p className="text-sm text-[#5c6670]">
                    We&apos;ll email a PDF tax invoice with GST breakdown and bank transfer details to <strong>{purchaserEmail || 'your email'}</strong>.
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
                ? 'Invoice will be sent via Stripe'
                : 'Secure checkout powered by Stripe'}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
