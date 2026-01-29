'use client';

import { useState } from 'react';
import { joinWaitlist } from '@/lib/waitlist-actions';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await joinWaitlist(email);

    if (result.success) {
      setSubmitted(true);
      setAlreadyExists(result.alreadyExists || false);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  }

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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-border">
      <h3 className="text-lg font-bold text-navy mb-2">Get notified when registration opens</h3>
      <p className="text-muted text-sm mb-6">
        Enter your email and we&apos;ll let you know when public registration is available.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
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
      </div>
    </form>
  );
}
