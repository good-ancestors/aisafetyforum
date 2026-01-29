'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import MultiTicketRegistrationForm from '@/components/MultiTicketRegistrationForm';
import { validateAccessCode, type CouponValidationResult } from '@/lib/coupon-actions';

interface InitialProfile {
  email: string;
  name: string;
  role: string;
  organisation: string;
}

interface GatedRegistrationProps {
  initialProfile?: InitialProfile;
}

export default function GatedRegistration({ initialProfile }: GatedRegistrationProps) {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get('code');
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [code, setCode] = useState(urlCode?.toUpperCase() || '');
  const [isValidating, setIsValidating] = useState(!!urlCode);
  const [error, setError] = useState<string | null>(null);
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<CouponValidationResult['discount'] | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const hasAutoValidated = useRef(false);

  // Waitlist form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  async function handleValidateCode(codeToValidate?: string) {
    const codeValue = codeToValidate || code;
    if (!codeValue.trim()) {
      setError('Please enter a code');
      return;
    }

    setIsValidating(true);
    setError(null);

    const result = await validateAccessCode(codeValue.trim());

    if (result.valid && result.grantsAccess) {
      setValidatedCode(codeValue.toUpperCase());
      setDiscount(result.discount || null);
      setIsRegistering(true);
    } else {
      setError(result.error || 'Invalid code');
    }

    setIsValidating(false);
  }

  // Auto-validate URL code on mount (only once)
  useEffect(() => {
    if (urlCode && !hasAutoValidated.current) {
      hasAutoValidated.current = true;
      const timeoutId = setTimeout(() => {
        handleValidateCode(urlCode);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidateCode();
    }
  }

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setWaitlistError(null);

    const { joinWaitlist } = await import('@/lib/waitlist-actions');
    const result = await joinWaitlist(email);

    if (result.success) {
      setSubmitted(true);
      setAlreadyExists(result.alreadyExists || false);
    } else {
      setWaitlistError(result.error || 'Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  }

  // Show registration form after successful code validation
  if (isRegistering) {
    return (
      <div>
        {/* Success banner */}
        {validatedCode && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-800">
                  {discount ? 'Early access granted with discount' : 'Early access granted'}
                </p>
                {discount && (
                  <p className="text-sm text-green-700">{discount.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <MultiTicketRegistrationForm
          initialProfile={initialProfile}
          preValidatedCode={validatedCode}
          preAppliedDiscount={discount}
        />
      </div>
    );
  }

  // Loading state while auto-validating URL code
  if (isValidating && urlCode && !error) {
    return (
      <div className="bg-white rounded-lg p-8 border border-border text-center">
        <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted">Validating your code...</p>
      </div>
    );
  }

  // Waitlist success state
  if (submitted) {
    return (
      <div className="bg-white rounded-lg p-8 border border-border text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-navy mb-2">
          {alreadyExists ? "You're already on the list!" : "You're on the list!"}
        </h3>
        <p className="text-muted">
          {alreadyExists
            ? "We already have your email. We'll notify you when public registration opens."
            : "We'll email you when public registration opens."}
        </p>
      </div>
    );
  }

  // Default: Waitlist form with code entry option (all in one card)
  return (
    <div className="bg-white rounded-lg p-8 border border-border">
      <h3 className="text-lg font-bold text-navy mb-2">Get notified when registration opens</h3>
      <p className="text-muted text-sm mb-6">
        Enter your email and we&apos;ll let you know when public registration is available.
      </p>

      {waitlistError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {waitlistError}
        </div>
      )}

      <form onSubmit={handleWaitlistSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="px-6 py-2 bg-navy text-white font-bold rounded-md hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Joining...' : 'Notify me'}
        </button>
      </form>

      {/* Code entry - inline below */}
      <div className="mt-6 pt-6 border-t border-border">
        {!showCodeEntry ? (
          <button
            onClick={() => setShowCodeEntry(true)}
            className="text-sm text-muted hover:text-brand-blue transition-colors"
          >
            Have an invite code?
          </button>
        ) : (
          <div>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Enter code"
                className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent uppercase font-mono tracking-wider text-sm"
                disabled={isValidating}
                autoFocus
              />
              <button
                onClick={() => handleValidateCode()}
                disabled={isValidating || !code.trim()}
                className="px-4 py-2 text-sm bg-brand-blue text-white font-bold rounded-md hover:bg-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
