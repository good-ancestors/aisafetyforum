'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSpeakerProposal } from '@/lib/application-actions';

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

interface SpeakerProposalEditFormProps {
  proposal: {
    id: string;
    format: string;
    abstract: string;
    travelSupport: string;
    anythingElse: string;
  };
  isEditable: boolean;
}

export default function SpeakerProposalEditForm({
  proposal,
  isEditable,
}: SpeakerProposalEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(proposal.format);
  const [travelSupport, setTravelSupport] = useState(proposal.travelSupport);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditable) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const data = {
      format: selectedFormat,
      abstract: formData.get('abstract') as string,
      travelSupport: travelSupport,
      anythingElse: formData.get('anythingElse') as string,
    };

    const result = await updateSpeakerProposal(proposal.id, data);

    if (result.success) {
      router.push('/dashboard/applications');
    } else {
      setError(result.error || 'An error occurred');
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-[--border]">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Format */}
        <div>
          <label className="block text-sm font-bold text-[--navy] mb-2">
            Session Format
          </label>
          <div className="space-y-2">
            {sessionFormats.map((format) => (
              <label
                key={format.id}
                className={`flex items-start gap-3 p-3 border-l-4 ${
                  selectedFormat === format.value
                    ? 'border-[--cyan] bg-[--cyan]/5 ring-2 ring-[--cyan]'
                    : 'border-[--navy] bg-[--bg-light]'
                } rounded cursor-pointer ${
                  isEditable ? 'hover:bg-[--bg-light]' : 'opacity-75 cursor-not-allowed'
                } transition-colors`}
              >
                <input
                  type="radio"
                  name="formatRadio"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => isEditable && setSelectedFormat(e.target.value)}
                  disabled={!isEditable}
                  className="mt-1 w-4 h-4 text-[--cyan] border-[--border] focus:ring-[--cyan]"
                />
                <div>
                  <div className="font-bold text-[--navy] text-sm">{format.label}</div>
                  <div className="text-xs text-[--text-muted]">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-bold text-[--navy] mb-2">
            Session Abstract
          </label>
          <p className="text-sm text-[--text-muted] mb-2">
            What you&apos;d like to cover and why it matters
          </p>
          <textarea
            id="abstract"
            name="abstract"
            required
            maxLength={1200}
            rows={6}
            defaultValue={proposal.abstract}
            disabled={!isEditable}
            className="w-full px-4 py-2 border border-[--border] rounded-md focus:outline-none focus:ring-2 focus:ring-[--cyan] focus:border-transparent disabled:bg-[--bg-light] disabled:cursor-not-allowed"
          />
        </div>

        {/* Travel Support */}
        <div>
          <label className="block text-sm font-bold text-[--navy] mb-2">
            Travel Support
          </label>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 ${!isEditable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="travelSupport"
                value="No"
                checked={travelSupport === 'No'}
                onChange={(e) => isEditable && setTravelSupport(e.target.value)}
                disabled={!isEditable}
                className="w-4 h-4 text-[--cyan] border-[--border] focus:ring-[--cyan]"
              />
              <span className="text-sm">No thanks, I can cover my own travel</span>
            </label>
            <label className={`flex items-center gap-3 ${!isEditable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="travelSupport"
                value="Yes"
                checked={travelSupport === 'Yes'}
                onChange={(e) => isEditable && setTravelSupport(e.target.value)}
                disabled={!isEditable}
                className="w-4 h-4 text-[--cyan] border-[--border] focus:ring-[--cyan]"
              />
              <span className="text-sm">Yes, I&apos;d need support to attend</span>
            </label>
            <label className={`flex items-center gap-3 ${!isEditable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="travelSupport"
                value="Maybe"
                checked={travelSupport === 'Maybe'}
                onChange={(e) => isEditable && setTravelSupport(e.target.value)}
                disabled={!isEditable}
                className="w-4 h-4 text-[--cyan] border-[--border] focus:ring-[--cyan]"
              />
              <span className="text-sm">Possibly — I&apos;d like to explore options</span>
            </label>
          </div>
        </div>

        {/* Travel Estimate / Additional Info */}
        {(travelSupport === 'Yes' || travelSupport === 'Maybe') && (
          <div>
            <label htmlFor="anythingElse" className="block text-sm font-bold text-[--navy] mb-2">
              Travel Support Details
            </label>
            <p className="text-sm text-[--text-muted] mb-2">
              Include where you&apos;re travelling from and accommodation needs
            </p>
            <textarea
              id="anythingElse"
              name="anythingElse"
              rows={3}
              defaultValue={proposal.anythingElse}
              disabled={!isEditable}
              placeholder="e.g. $400 domestic flight from Brisbane & $300 for 2 nights accommodation"
              className="w-full px-4 py-2 border border-[--border] rounded-md focus:outline-none focus:ring-2 focus:ring-[--cyan] focus:border-transparent disabled:bg-[--bg-light] disabled:cursor-not-allowed"
            />
          </div>
        )}

        {/* Submit Button */}
        {isEditable && (
          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-8 py-3 text-base font-bold bg-[--navy] text-white rounded-md hover:bg-[--navy-light] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/applications')}
              className="px-6 py-3 text-base font-medium border border-[--border] text-[--text-body] rounded-md hover:bg-[--bg-light] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
