'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateScholarshipApplication } from '@/lib/application-actions';

const backgroundOptions = [
  { id: 'student', name: 'background_student', label: 'I am a student (undergraduate, postgraduate, or PhD)' },
  { id: 'civil_society', name: 'background_civil_society', label: 'I work in civil society, non-profit, or public interest' },
  { id: 'independent', name: 'background_independent', label: 'I am an independent researcher or practitioner' },
  { id: 'lmic', name: 'background_lmic', label: 'I am from a low or middle-income country' },
  { id: 'gender_diverse', name: 'background_gender', label: 'I identify as a woman, non-binary, or gender diverse' },
  { id: 'first_nations', name: 'background_first_nations', label: 'I identify as First Nations or Indigenous' },
  { id: 'cald', name: 'background_cald', label: 'I am from a culturally or linguistically diverse background' },
  { id: 'neurodiverse', name: 'background_neurodiverse', label: 'I am neurodiverse' },
  { id: 'disability', name: 'background_disability', label: 'I have a disability or chronic health condition' },
  { id: 'other_barriers', name: 'background_other_barriers', label: 'I face other barriers to attending (please specify in pitch)' },
];

interface ScholarshipEditFormProps {
  application: {
    id: string;
    whyAttend: string;
    travelSupport: string;
    amount: string;
    backgroundInfo: string[];
  };
  isEditable: boolean;
}

export default function ScholarshipEditForm({
  application,
  isEditable,
}: ScholarshipEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelSupport, setTravelSupport] = useState(application.travelSupport);
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<string[]>(application.backgroundInfo);

  const toggleBackground = (id: string) => {
    if (!isEditable) return;
    setSelectedBackgrounds((prev) =>
      prev.includes(id) ? prev.filter((bg) => bg !== id) : [...prev, id]
    );
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditable) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const data = {
      whyAttend: formData.get('whyAttend') as string,
      travelSupport: travelSupport,
      amount: formData.get('amount') as string,
      backgroundInfo: selectedBackgrounds,
    };

    const result = await updateScholarshipApplication(application.id, data);

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
        {/* Background Info */}
        <div>
          <label className="block text-sm font-bold text-[--navy] mb-2">
            Background Information
          </label>
          <p className="text-sm text-[--text-muted] mb-3">
            Select any that apply
          </p>
          <div className="space-y-2">
            {backgroundOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-3 ${
                  isEditable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedBackgrounds.includes(option.id)}
                  onChange={() => toggleBackground(option.id)}
                  disabled={!isEditable}
                  className="w-4 h-4 mt-0.5 text-[--cyan] border-[--border] rounded focus:ring-[--cyan]"
                />
                <span className="text-sm text-[--text-body]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scholarship Pitch */}
        <div>
          <label htmlFor="whyAttend" className="block text-sm font-bold text-[--navy] mb-2">
            Scholarship Pitch
          </label>
          <p className="text-sm text-[--text-muted] mb-2">
            Tell us how attending the forum would support your work
          </p>
          <textarea
            id="whyAttend"
            name="whyAttend"
            required
            maxLength={900}
            rows={5}
            defaultValue={application.whyAttend}
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
              <span className="text-sm">No thanks, I just need the free registration</span>
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
              <span className="text-sm">Yes, I&apos;d need travel support to attend</span>
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

        {/* Travel Amount */}
        {(travelSupport === 'Yes' || travelSupport === 'Maybe') && (
          <div>
            <label htmlFor="amount" className="block text-sm font-bold text-[--navy] mb-2">
              Estimated Support Amount
            </label>
            <p className="text-sm text-[--text-muted] mb-2">
              Include where you&apos;re travelling from and accommodation needs
            </p>
            <textarea
              id="amount"
              name="amount"
              rows={2}
              defaultValue={application.amount}
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
