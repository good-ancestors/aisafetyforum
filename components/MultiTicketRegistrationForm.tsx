'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AttendeeCard, OrderSummary, PaymentMethodSelector } from '@/components/registration';
import { useMultiTicketForm } from '@/components/registration/useMultiTicketForm';
import { createMultiTicketCheckout, createInvoiceOrder, type MultiTicketFormData } from '@/lib/registration-actions';
import { earlyBirdDeadline, type TicketTierId } from '@/lib/stripe-config';

interface InitialProfile {
  email: string;
  name: string;
  role: string;
  organisation: string;
}

interface PreAppliedDiscount {
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  description: string;
}

interface MultiTicketRegistrationFormProps {
  initialProfile?: InitialProfile;
  preValidatedCode?: string | null;
  preAppliedDiscount?: PreAppliedDiscount | null;
}

// eslint-disable-next-line max-lines-per-function, complexity -- UI component; logic extracted to useMultiTicketForm hook
export default function MultiTicketRegistrationForm({
  initialProfile,
  preValidatedCode,
  preAppliedDiscount,
}: MultiTicketRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useMultiTicketForm({ initialProfile, preValidatedCode, preAppliedDiscount });

  const deadlineDate = new Date(earlyBirdDeadline).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const effectiveAttendees = form.getEffectiveAttendees();

    // Validate all attendees have required fields
    for (let i = 0; i < effectiveAttendees.length; i++) {
      const a = effectiveAttendees[i];
      if (!a.email || !a.name || !a.ticketType) {
        setError(`Please fill in all required fields for attendee ${i + 1}`);
        setIsSubmitting(false);
        return;
      }
    }

    const formData: MultiTicketFormData = {
      purchaserEmail: form.purchaserEmail,
      purchaserName: form.purchaserName,
      purchaserRole: form.purchaserRole || undefined,
      purchaserOrg: form.purchaserOrg || undefined,
      attendees: effectiveAttendees.map((a) => ({
        email: a.email,
        name: a.name,
        role: a.role || undefined,
        organisation: a.organisation || undefined,
        ticketType: a.ticketType as TicketTierId,
      })),
      couponCode: preValidatedCode || (form.couponApplied ? form.couponCode : undefined),
    };

    if (form.paymentMethod === 'invoice') {
      const result = await createInvoiceOrder({
        ...formData,
        orgName: form.purchaserOrg || undefined,
        orgABN: form.orgABN || undefined,
        poNumber: form.poNumber || undefined,
      });

      if (result.success) {
        router.push(`/register/invoice-sent?order_id=${result.orderId}`);
      } else {
        setError(result.error || 'An error occurred');
        setIsSubmitting(false);
      }
    } else {
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-border">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Early Bird Banner */}
        {form.earlyBird && (
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

        {/* Purchaser Section */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-border">
            Your Details (Purchaser)
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="purchaserEmail" className="block text-sm font-bold text-navy mb-2">
                Email *
              </label>
              <input
                type="email"
                id="purchaserEmail"
                required
                value={form.purchaserEmail}
                onChange={(e) => form.handlePurchaserEmailChange(e.target.value)}
                onBlur={form.handlePurchaserEmailBlur}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="purchaserName" className="block text-sm font-bold text-navy mb-2">
                Name *
              </label>
              <input
                type="text"
                id="purchaserName"
                required
                value={form.purchaserName}
                onChange={(e) => form.handlePurchaserNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchaserRole" className="block text-sm font-bold text-navy mb-2">
                  Role / Title
                </label>
                <input
                  type="text"
                  id="purchaserRole"
                  value={form.purchaserRole}
                  onChange={(e) => form.handlePurchaserRoleChange(e.target.value)}
                  placeholder="e.g., Research Scientist"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="purchaserOrg" className="block text-sm font-bold text-navy mb-2">
                  Organisation
                </label>
                <input
                  type="text"
                  id="purchaserOrg"
                  value={form.purchaserOrg}
                  onChange={(e) => form.handlePurchaserOrgChange(e.target.value)}
                  placeholder="Your organisation"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-light p-3 rounded-md">
              <input
                type="checkbox"
                id="purchaserIsAttendee"
                checked={form.purchaserIsAttendee}
                onChange={(e) => form.handlePurchaserIsAttendeeChange(e.target.checked)}
                className="w-4 h-4 text-cyan border-border rounded focus:ring-cyan"
              />
              <label htmlFor="purchaserIsAttendee" className="text-sm text-body">
                I am booking for myself (use my details for the first ticket)
              </label>
            </div>
          </div>
        </section>

        {/* Attendees Section */}
        <section>
          <h2 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-border">
            Attendees ({form.attendees.length} ticket{form.attendees.length !== 1 ? 's' : ''})
          </h2>

          <div className="space-y-6">
            {form.attendees.map((attendee, index) => (
              <AttendeeCard
                // eslint-disable-next-line react/no-array-index-key -- Attendees are dynamically added/removed without stable IDs
                key={index}
                index={index}
                attendee={attendee}
                isPurchaserAttendee={form.purchaserIsAttendee}
                purchaserEmail={form.purchaserEmail}
                purchaserName={form.purchaserName}
                purchaserRole={form.purchaserRole}
                purchaserOrg={form.purchaserOrg}
                purchaserFreeTicket={form.purchaserFreeTicket}
                totalAttendees={form.attendees.length}
                onUpdateAttendee={form.updateAttendee}
                onRemoveAttendee={form.removeAttendee}
                onEmailBlur={form.handleAttendeeEmailBlur}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={form.addAttendee}
            className="mt-4 w-full py-3 text-sm font-bold text-brand-blue hover:text-navy border border-dashed border-brand-blue hover:border-navy rounded-md flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Attendee
          </button>
        </section>

        {/* Coupon Code - hide if pre-validated access code */}
        {!preValidatedCode && (
          <section>
            <h2 className="text-lg font-bold text-navy mb-4 pb-2 border-b border-border">
              Discount Code
            </h2>

            {form.couponApplied && form.discount && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-bold text-green-800">Discount applied: {form.discount.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={form.handleRemoveCoupon}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {!form.couponApplied && (
              <div className="space-y-3">
                {form.couponError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {form.couponError}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => form.setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent uppercase"
                  />
                  <button
                    type="button"
                    onClick={form.handleApplyCoupon}
                    disabled={form.validatingCoupon || !form.couponCode.trim()}
                    className="px-6 py-2 text-sm font-bold bg-navy text-white rounded-md hover:bg-navy-light transition-colors disabled:opacity-50"
                  >
                    {form.validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Payment Method */}
        {form.totals.total > 0 && (
          <PaymentMethodSelector
            paymentMethod={form.paymentMethod}
            onPaymentMethodChange={form.setPaymentMethod}
            purchaserEmail={form.purchaserEmail}
            orgABN={form.orgABN}
            onOrgABNChange={form.setOrgABN}
            poNumber={form.poNumber}
            onPoNumberChange={form.setPoNumber}
          />
        )}

        {/* Order Summary */}
        <OrderSummary totals={form.totals} ticketCount={form.attendees.length} />

        {/* Validation Alert */}
        {!form.isFormValid && !isSubmitting && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800">Please complete the required fields</p>
                <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                  {form.validationErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || !form.isFormValid}
            className="w-full px-8 py-4 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Processing...'
              : form.totals.total === 0
                ? 'Complete Registration'
                : form.paymentMethod === 'invoice'
                  ? `Request Invoice — $${(form.totals.total / 100).toFixed(2)} AUD`
                  : `Pay $${(form.totals.total / 100).toFixed(2)} AUD`}
          </button>
          {form.totals.total > 0 && form.isFormValid && (
            <p className="text-sm text-muted mt-4 text-center">
              {form.paymentMethod === 'invoice'
                ? 'Invoice will be sent via email'
                : 'Secure checkout powered by Stripe'}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
