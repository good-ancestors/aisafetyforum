'use client';

import { useState } from 'react';
import { submitFundingApplication, type FundingApplicationFormData } from '@/lib/actions';
import { eventConfig } from '@/lib/config';

export default function FundingApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const data: FundingApplicationFormData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      organisation: formData.get('organisation') as string,
      role: formData.get('role') as string,
      whyAttend: formData.get('whyAttend') as string,
      amount: formData.get('amount') as string,
      day1: formData.get('day1') === 'on',
      day2: formData.get('day2') === 'on',
      acceptedTerms: formData.get('acceptedTerms') === 'on',
    };

    const result = await submitFundingApplication(data);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || 'An error occurred');
    }

    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-lg p-8 border border-[#e0e4e8] text-center">
        <div className="w-16 h-16 bg-[#00d4ff] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0a1f5c] mb-3">Thanks!</h2>
        <p className="text-[#333333] mb-6">
          We've received your application. You'll hear from us by [DATE].
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-[#e0e4e8]">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Where are you based? *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">City/region</p>
          <input
            type="text"
            id="location"
            name="location"
            required
            placeholder="e.g. Melbourne, VIC"
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Organisation */}
        <div>
          <label htmlFor="organisation" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Organisation or affiliation *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            e.g. university, employer, or "Independent"
          </p>
          <input
            type="text"
            id="organisation"
            name="organisation"
            required
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Role *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            e.g. "PhD student, CS" or "Policy analyst"
          </p>
          <input
            type="text"
            id="role"
            name="role"
            required
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Why Attend */}
        <div>
          <label htmlFor="whyAttend" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Why do you want to attend? *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            Brief is fine. (75 words max)
          </p>
          <textarea
            id="whyAttend"
            name="whyAttend"
            required
            maxLength={450}
            rows={4}
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            How much funding do you need (AUD)? *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            e.g. "$400 — flights + 2 nights accommodation" (just applying for a free ticket then enter $0)
          </p>
          <input
            type="text"
            id="amount"
            name="amount"
            required
            placeholder="e.g. $400 — flights + accommodation"
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Days */}
        <div>
          <label className="block text-sm font-bold text-[#0a1f5c] mb-3">
            Which days would you attend? *
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="day1"
                name="day1"
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] rounded focus:ring-[#00d4ff]"
              />
              <label htmlFor="day1" className="text-sm text-[#333333]">
                {eventConfig.day1.label} ({eventConfig.day1.date})
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="day2"
                name="day2"
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] rounded focus:ring-[#00d4ff]"
              />
              <label htmlFor="day2" className="text-sm text-[#333333]">
                {eventConfig.day2.label} ({eventConfig.day2.date})
              </label>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptedTerms"
            name="acceptedTerms"
            required
            className="mt-1 w-4 h-4 text-[#00d4ff] border-[#e0e4e8] rounded focus:ring-[#00d4ff]"
          />
          <label htmlFor="acceptedTerms" className="text-sm text-[#333333]">
            I can attend if funded and accept the terms *
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 text-base font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </form>
  );
}
