'use client';

import { useState } from 'react';
import { submitSpeakerProposal, type SpeakerProposalFormData } from '@/lib/actions';

const sessionFormats = [
  {
    id: 'keynote',
    value: 'Keynote',
    label: 'Keynote',
    description: '20-30 minute presentation to the full audience',
  },
  {
    id: 'lightning',
    value: 'Lightning talk',
    label: 'Lightning Talk',
    description: '5-10 minute focused presentation on a specific topic',
  },
  {
    id: 'workshop',
    value: 'Workshop',
    label: 'Workshop',
    description: 'Interactive session with hands-on activities (45-90 mins)',
  },
  {
    id: 'panel',
    value: 'Panel',
    label: 'Panel Discussion',
    description: 'Moderated discussion with multiple speakers on a theme',
  },
  {
    id: 'flexible',
    value: 'Flexible',
    label: 'Flexible',
    description: "Not sure yet — we'll work with you to find the right format",
  },
];

// eslint-disable-next-line max-lines-per-function -- Speaker proposal form with format selection, abstract, and travel info
export default function SpeakerProposalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelSupport, setTravelSupport] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');

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
      <div className="bg-white rounded-lg p-8 border border-border text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-3">Thanks!</h2>
        <p className="text-body mb-6">
          We&apos;ve received your proposal. You&apos;ll hear from us by soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-brand-blue hover:text-teal font-medium text-sm underline"
        >
          Submit another proposal
        </button>
      </div>
    );
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
        {/* Session Section Header */}
        <div className="border-b-2 border-navy pb-2">
          <h3 className="font-bold text-lg text-navy">Your Session Idea</h3>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            What format works best? *
          </label>
          <input type="hidden" name="format" value={selectedFormat} />
          <div className="space-y-2">
            {sessionFormats.map((format) => (
              <label
                key={format.id}
                className={`flex items-start gap-3 p-3 border-l-4 ${
                  selectedFormat === format.value
                    ? 'border-cyan bg-cyan/5 ring-2 ring-cyan'
                    : 'border-navy bg-cream'
                } rounded cursor-pointer hover:bg-light transition-colors`}
              >
                <input
                  type="radio"
                  name="formatRadio"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  required
                  className="mt-1 w-4 h-4 text-cyan border-border focus:ring-cyan"
                />
                <div>
                  <div className="font-bold text-navy text-sm">{format.label}</div>
                  <div className="text-xs text-muted">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-bold text-navy mb-2">
            Tell us about your session idea *
          </label>
          <p className="text-sm text-muted mb-2">
            Share what you&apos;d like to cover and why it matters. Don&apos;t worry about perfection — we&apos;re excited to hear your ideas! (Around 200 words)
          </p>
          <textarea
            id="abstract"
            name="abstract"
            required
            maxLength={1200}
            rows={6}
            placeholder="e.g. I'd like to share recent findings on..., or lead a discussion about..."
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Profile Section Header */}
        <div className="border-b-2 border-navy pb-2 pt-2">
          <h3 className="font-bold text-lg text-navy">About You</h3>
        </div>

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
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
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

        {/* Title/Role */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-navy mb-2">
            Your role or title *
          </label>
          <p className="text-sm text-muted mb-2">
            e.g. &quot;Research Fellow&quot;, &quot;PhD Student, Computer Science&quot;, or &quot;Policy Analyst&quot;
          </p>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g. Research Fellow"
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

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-bold text-navy mb-2">
            Short bio *
          </label>
          <p className="text-sm text-muted mb-2">
            A few sentences about your background. (Around 75 words)
          </p>
          <textarea
            id="bio"
            name="bio"
            required
            maxLength={450}
            rows={4}
            placeholder="e.g. Your research focus, current work, or relevant experience..."
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Profile Links */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            Profile links
          </label>
          <p className="text-sm text-muted mb-3">
            Optional — add any professional profiles you&apos;d like to share
          </p>
          <div className="space-y-3">
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              placeholder="LinkedIn URL (e.g. linkedin.com/in/yourname)"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="twitter"
              name="twitter"
              placeholder="X/Twitter URL (e.g. x.com/yourhandle)"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="bluesky"
              name="bluesky"
              placeholder="Bluesky URL (e.g. bsky.app/profile/yourname)"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
            />
            <input
              type="url"
              id="website"
              name="website"
              placeholder="Personal website or academic profile URL"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Travel Section Header */}
        <div className="border-b-2 border-navy pb-2 pt-2">
          <h3 className="font-bold text-lg text-navy">Travel Support</h3>
        </div>

        {/* Travel Support */}
        <div>
          <label className="block text-sm font-bold text-navy mb-3">
            Would travel support help you attend? *
          </label>
          <p className="text-sm text-muted mb-3">
            We have limited funding available. Let us know if support would make a difference.
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
                className="w-4 h-4 text-cyan border-border focus:ring-cyan"
              />
              <label htmlFor="travelNo" className="text-sm text-body">
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
                className="w-4 h-4 text-cyan border-border focus:ring-cyan"
              />
              <label htmlFor="travelYes" className="text-sm text-body">
                Yes, I&apos;d need support to attend
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="travelMaybe"
                name="travelSupport"
                value="Maybe"
                onChange={(e) => setTravelSupport(e.target.value)}
                className="w-4 h-4 text-cyan border-border focus:ring-cyan"
              />
              <label htmlFor="travelMaybe" className="text-sm text-body">
                Possibly — I&apos;d like to explore options
              </label>
            </div>
          </div>
        </div>

        {/* Travel Estimate (conditional) */}
        {(travelSupport === 'Yes' || travelSupport === 'Maybe') && (
          <div>
            <label htmlFor="travelEstimate" className="block text-sm font-bold text-navy mb-2">
              Rough estimate of support needed
            </label>
            <p className="text-sm text-muted mb-2">
              Include where you&apos;re travelling from and accommodation needs. Example: &quot;$250 domestic economy flight from Melbourne & $200 for 2 nights at Sydney Central YHA&quot;
            </p>
            <textarea
              id="travelEstimate"
              name="anythingElse"
              rows={2}
              maxLength={500}
              placeholder="e.g. $400 domestic flight from Brisbane & $300 for 2 nights accommodation"
              className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </form>
  );
}
