'use client';

import { useState } from 'react';
import { submitSpeakerProposal, type SpeakerProposalFormData } from '@/lib/actions';

export default function SpeakerProposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelSupport, setTravelSupport] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const data: SpeakerProposalFormData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      organisation: (formData.get('organisation') as string) || undefined,
      title: formData.get('title') as string,
      bio: formData.get('bio') as string,
      linkedin: (formData.get('linkedin') as string) || undefined,
      twitter: (formData.get('twitter') as string) || undefined,
      bluesky: (formData.get('bluesky') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      format: formData.get('format') as string,
      abstract: formData.get('abstract') as string,
      travelSupport: formData.get('travelSupport') as string,
      anythingElse: formData.get('anythingElse') as string || undefined,
      acceptedTerms: true,
    };

    const result = await submitSpeakerProposal(data);

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
          We've received your proposal. You'll hear from us by [DATE].
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[#0047ba] hover:text-[#0099cc] font-medium text-sm underline"
        >
          Submit another proposal
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
        {/* Session Section Header */}
        <div className="border-b-2 border-[#0a1f5c] pb-2">
          <h3 className="font-bold text-lg text-[#0a1f5c]">Your Session Idea</h3>
        </div>

        {/* Format */}
        <div>
          <label htmlFor="format" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            What format works best? *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            Not sure? Choose "Flexible" — we can work with you to find the right format.
          </p>
          <select
            id="format"
            name="format"
            required
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          >
            <option value="">Select a format</option>
            <option value="Keynote">Keynote</option>
            <option value="Lightning talk">Lightning talk</option>
            <option value="Workshop">Workshop</option>
            <option value="Panel">Panel</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        {/* Abstract */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Tell us about your session idea *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            Share what you'd like to cover and why it matters. Don't worry about perfection — we're excited to hear your ideas! (Around 200 words)
          </p>
          <textarea
            id="abstract"
            name="abstract"
            required
            maxLength={1200}
            rows={6}
            placeholder="e.g. I'd like to share recent findings on..., or lead a discussion about..."
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Profile Section Header */}
        <div className="border-b-2 border-[#0a1f5c] pb-2 pt-2">
          <h3 className="font-bold text-lg text-[#0a1f5c]">About You</h3>
        </div>

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

        {/* Title/Role */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Your role or title *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            e.g. "Research Fellow", "PhD Student, Computer Science", or "Policy Analyst"
          </p>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g. Research Fellow"
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Organisation */}
        <div>
          <label htmlFor="organisation" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Organisation
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            Optional — your university, employer, or leave blank if independent
          </p>
          <input
            type="text"
            id="organisation"
            name="organisation"
            placeholder="e.g. Australian National University"
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Short bio *
          </label>
          <p className="text-sm text-[#5c6670] mb-2">
            A few sentences about your background — we'll use this in the program. (Around 75 words)
          </p>
          <textarea
            id="bio"
            name="bio"
            required
            maxLength={450}
            rows={4}
            placeholder="e.g. Your research focus, current work, or relevant experience..."
            className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
          />
        </div>

        {/* Profile Links */}
        <div>
          <label className="block text-sm font-bold text-[#0a1f5c] mb-2">
            Profile links
          </label>
          <p className="text-sm text-[#5c6670] mb-3">
            Optional — add any professional profiles you'd like to share
          </p>
          <div className="space-y-3">
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              placeholder="LinkedIn URL (e.g. linkedin.com/in/yourname)"
              className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="twitter"
              name="twitter"
              placeholder="X/Twitter URL (e.g. x.com/yourhandle)"
              className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="bluesky"
              name="bluesky"
              placeholder="Bluesky URL (e.g. bsky.app/profile/yourname)"
              className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="website"
              name="website"
              placeholder="Personal website or academic profile URL"
              className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Travel Section Header */}
        <div className="border-b-2 border-[#0a1f5c] pb-2 pt-2">
          <h3 className="font-bold text-lg text-[#0a1f5c]">Travel Support</h3>
        </div>

        {/* Travel Support */}
        <div>
          <label className="block text-sm font-bold text-[#0a1f5c] mb-3">
            Would travel support help you attend? *
          </label>
          <p className="text-sm text-[#5c6670] mb-3">
            We have limited funding available. Let us know if support would make a difference — it won't affect your proposal evaluation.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="travelNo"
                name="travelSupport"
                value="No"
                required
                onChange={(e) => setTravelSupport(e.target.value)}
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] focus:ring-[#00d4ff]"
              />
              <label htmlFor="travelNo" className="text-sm text-[#333333]">
                No thanks, I can cover my own travel
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="travelYes"
                name="travelSupport"
                value="Yes"
                onChange={(e) => setTravelSupport(e.target.value)}
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] focus:ring-[#00d4ff]"
              />
              <label htmlFor="travelYes" className="text-sm text-[#333333]">
                Yes, I'd need support to attend
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="travelMaybe"
                name="travelSupport"
                value="Maybe"
                onChange={(e) => setTravelSupport(e.target.value)}
                className="w-4 h-4 text-[#00d4ff] border-[#e0e4e8] focus:ring-[#00d4ff]"
              />
              <label htmlFor="travelMaybe" className="text-sm text-[#333333]">
                Possibly — I'd like to explore options
              </label>
            </div>
          </div>
        </div>

        {/* Travel Estimate (conditional) */}
        {(travelSupport === 'Yes' || travelSupport === 'Maybe') && (
          <div>
            <label htmlFor="travelEstimate" className="block text-sm font-bold text-[#0a1f5c] mb-2">
              Rough estimate of support needed
            </label>
            <p className="text-sm text-[#5c6670] mb-2">
              Just a ballpark figure helps us plan — e.g. "$500 for flights from Perth" or "$800 for flights + 2 nights accommodation"
            </p>
            <input
              type="text"
              id="travelEstimate"
              name="anythingElse"
              placeholder="e.g. $500 — flights from Perth"
              className="w-full px-4 py-2 border border-[#e0e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 text-base font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </form>
  );
}
