'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { validateCoupon } from '@/lib/coupon-actions';
import { checkFreeTicketEmail } from '@/lib/free-ticket-actions';
import { createCheckoutSession, type RegistrationFormData } from '@/lib/registration-actions';
import { ticketTiers, isEarlyBirdActive, earlyBirdDeadline, type TicketTierId } from '@/lib/stripe-config';

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState<{
    type: 'percentage' | 'fixed' | 'free';
    value: number;
    description?: string;
    originalAmount?: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [freeTicketReason, setFreeTicketReason] = useState<string | null>(null);

  const earlyBird = isEarlyBirdActive();
  const deadlineDate = new Date(earlyBirdDeadline).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    if (!selectedTicket) {
      setError('Please select a ticket type first');
      return;
    }

    setValidatingCoupon(true);
    setError(null);

    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email) {
      setError('Please enter your email address first');
      setValidatingCoupon(false);
      return;
    }

    const result = await validateCoupon(couponCode, email, selectedTicket as TicketTierId);

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

  async function handleEmailCheck(email: string) {
    if (!email || !email.includes('@')) return;

    // Check if email is on free ticket list
    const freeCheck = await checkFreeTicketEmail(email);
    if (freeCheck.isFree) {
      setFreeTicketReason(freeCheck.reason || 'Complimentary registration');
      // Automatically apply free discount
      const ticketPrice = selectedTicket ? ticketTiers.find(t => t.id === selectedTicket)?.price || 0 : 0;
      setDiscount({
        type: 'free',
        value: 100,
        originalAmount: ticketPrice,
        discountAmount: ticketPrice,
        finalAmount: 0,
        description: freeCheck.reason || 'Complimentary registration',
      });
      setCouponApplied(true);
      setCouponCode(''); // Clear any entered coupon code
    } else {
      setFreeTicketReason(null);
      if (!couponCode) {
        // Only clear discount if no coupon was manually applied
        setCouponApplied(false);
        setDiscount(null);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const data: RegistrationFormData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      organisation: (formData.get('organisation') as string) || undefined,
      ticketType: formData.get('ticketType') as TicketTierId,
      couponCode: couponApplied ? couponCode : undefined,
    };

    const result = await createCheckoutSession(data);

    if (result.success) {
      if (result.free) {
        // Free ticket - redirect to success page
        router.push(`/register/success?registration_id=${result.registrationId}`);
      } else if (result.url) {
        // Paid ticket - redirect to Stripe checkout
        window.location.href = result.url;
      }
    } else {
      setError(result.error || 'An error occurred');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-border">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-navy mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            onBlur={(e) => handleEmailCheck(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
          {freeTicketReason && (
            <div className="mt-3 bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-bold text-green-800 text-sm">Complimentary registration!</p>
                  <p className="text-sm text-green-700">{freeTicketReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-navy mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Organisation */}
        <div>
          <label htmlFor="organisation" className="block text-sm font-bold text-navy mb-2">
            Organisation
          </label>
          <p className="text-sm text-muted mb-2">
            Optional — your university, employer, or leave blank if independent
          </p>
          <input
            type="text"
            id="organisation"
            name="organisation"
            placeholder="e.g. Australian National University"
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Early Bird Banner */}
        {earlyBird && (
          <div className="bg-gradient-to-r from-navy to-brand-blue text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Ticket Type Selection */}
        <div>
          <label className="block text-sm font-bold text-navy mb-3">
            Select Ticket Type *
          </label>
          <div className="space-y-3">
            {ticketTiers.map((tier) => (
              <div key={tier.id} className={`border-l-4 ${tier.borderColor} bg-light rounded p-4`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="ticketType"
                    value={tier.id}
                    required
                    checked={selectedTicket === tier.id}
                    onChange={(e) => {
                      setSelectedTicket(e.target.value);
                      // Re-check email for free ticket when ticket type changes
                      const emailInput = document.getElementById('email') as HTMLInputElement;
                      if (emailInput?.value && freeTicketReason) {
                        handleEmailCheck(emailInput.value);
                      }
                    }}
                    className="w-4 h-4 text-cyan border-border focus:ring-cyan mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-navy">{tier.name}</div>
                        <div className="text-sm text-muted mt-1">{tier.description}</div>
                      </div>
                      <div className="ml-4 text-right">
                        {freeTicketReason ? (
                          <>
                            <div className="text-sm text-muted line-through">{earlyBird ? tier.earlyBirdPriceDisplay : tier.priceDisplay}</div>
                            <div className="text-xl font-bold text-green-600">$0.00 <span className="text-sm font-normal text-muted">inc GST</span></div>
                          </>
                        ) : earlyBird ? (
                          <>
                            <div className="text-sm text-muted line-through">{tier.priceDisplay}</div>
                            <div className={`text-xl font-bold ${tier.textColor}`}>
                              {tier.earlyBirdPriceDisplay} <span className="text-sm font-normal text-muted">inc GST</span>
                            </div>
                          </>
                        ) : (
                          <div className={`text-xl font-bold ${tier.textColor}`}>
                            {tier.priceDisplay} <span className="text-sm font-normal text-muted">inc GST</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Code */}
        {!freeTicketReason && (
          <div>
            <label htmlFor="couponCode" className="block text-sm font-bold text-navy mb-2">
              Have a coupon code?
            </label>
            <p className="text-sm text-muted mb-2">
              Enter your code for discounts or complimentary tickets
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                id="couponCode"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (couponApplied) {
                    setCouponApplied(false);
                    setDiscount(null);
                  }
                }}
                disabled={couponApplied}
                placeholder="e.g. SPEAKER2026"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              />
            {!couponApplied ? (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-6 py-2 text-sm font-bold bg-navy text-white rounded-md hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        )}

        {/* Discount Applied Message */}
        {couponApplied && discount && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-green-800 mb-1">Coupon applied!</p>
                <p className="text-sm text-green-700">{discount.description}</p>
                {discount.type === 'percentage' && discount.originalAmount && (
                  <p className="text-sm text-green-700 mt-1">
                    {discount.value}% discount: ${(discount.originalAmount / 100).toFixed(2)} → <strong>${(discount.finalAmount / 100).toFixed(2)}</strong>
                  </p>
                )}
                {discount.type === 'fixed' && discount.originalAmount && (
                  <p className="text-sm text-green-700 mt-1">
                    ${(discount.discountAmount / 100).toFixed(2)} discount: ${(discount.originalAmount / 100).toFixed(2)} → <strong>${(discount.finalAmount / 100).toFixed(2)}</strong>
                  </p>
                )}
                {discount.type === 'free' && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Complimentary ticket</strong> — No payment required
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Important Note */}
        {!couponApplied && (
          <div className="bg-light rounded-lg p-6 border-l-4 border-teal">
            <p className="text-sm text-body mb-3">
              To ensure the Forum remains sustainable and independent, we are introducing a tiered ticketing model. Revenue from industry tickets supports concession pricing and attendee scholarships.
            </p>
            <p className="text-sm text-body">
              If cost is a barrier to entry please purchase a concession ticket and consider applying for a scholarship (for free ticket and travel funding) if needed.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Processing...'
              : (freeTicketReason || (discount && discount.finalAmount === 0))
                ? 'Complete Registration'
                : 'Proceed to Payment'
            }
          </button>
          {!freeTicketReason && !(discount && discount.finalAmount === 0) && (
            <p className="text-sm text-muted mt-4 text-center">
              Secure checkout powered by Stripe
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
