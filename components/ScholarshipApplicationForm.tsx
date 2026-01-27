'use client';

import { useState } from 'react';
import { submitScholarshipApplication, type ScholarshipApplicationFormData } from '@/lib/actions';

export default function ScholarshipApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelSupport, setTravelSupport] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Collect background checkbox values
    const backgroundChecks: string[] = [];
    if (formData.get('background_student')) backgroundChecks.push('student');
    if (formData.get('background_civil_society')) backgroundChecks.push('civil_society');
    if (formData.get('background_independent')) backgroundChecks.push('independent');
    if (formData.get('background_lmic')) backgroundChecks.push('lmic');
    if (formData.get('background_gender')) backgroundChecks.push('gender_diverse');
    if (formData.get('background_first_nations')) backgroundChecks.push('first_nations');
    if (formData.get('background_cald')) backgroundChecks.push('cald');
    if (formData.get('background_neurodiverse')) backgroundChecks.push('neurodiverse');
    if (formData.get('background_disability')) backgroundChecks.push('disability');
    if (formData.get('background_other_barriers')) backgroundChecks.push('other_barriers');

    const data: ScholarshipApplicationFormData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      organisation: formData.get('organisation') as string,
      role: formData.get('role') as string,
      bio: formData.get('bio') as string,
      linkedin: (formData.get('linkedin') as string) || undefined,
      twitter: (formData.get('twitter') as string) || undefined,
      bluesky: (formData.get('bluesky') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      whyAttend: formData.get('whyAttend') as string,
      travelSupport: formData.get('travelSupport') as string,
      travelEstimate: (formData.get('travelEstimate') as string) || undefined,
      backgroundInfo: backgroundChecks.length > 0 ? backgroundChecks : undefined,
    };

    const result = await submitScholarshipApplication(data);

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
          We&apos;ve received your scholarship application. You&apos;ll hear from us soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-brand-blue hover:text-teal font-medium text-sm underline"
        >
          Submit another application
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
        {/* About You Section Header */}
        <div className="border-b-2 border-navy pb-2">
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

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-bold text-navy mb-2">
            Your role or title *
          </label>
          <p className="text-sm text-muted mb-2">
            e.g. &quot;Research Fellow&quot;, &quot;PhD Student, Computer Science&quot;, or &quot;Policy Analyst&quot;
          </p>
          <input
            type="text"
            id="role"
            name="role"
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
            A few sentences about your background and interest in AI safety. (Around 75 words)
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

        {/* Application Section Header */}
        <div className="border-b-2 border-navy pb-2 pt-2">
          <h3 className="font-bold text-lg text-navy">Your Application</h3>
        </div>

        {/* Self-identification */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            Help us understand your background
          </label>
          <p className="text-sm text-muted mb-3">
            Optional — select any that apply. This helps us prioritise scholarships for underrepresented groups.
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_student"
                value="student"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I am a student (undergraduate, postgraduate, or PhD)</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_civil_society"
                value="civil_society"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I work in civil society, non-profit, or public interest</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_independent"
                value="independent"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I am an independent researcher or practitioner</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_lmic"
                value="lmic"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I am from a low or middle-income country</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_gender"
                value="gender_diverse"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I identify as a woman, non-binary, or gender diverse</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_first_nations"
                value="first_nations"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I identify as First Nations or Indigenous</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_cald"
                value="cald"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I am from a culturally or linguistically diverse background</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_neurodiverse"
                value="neurodiverse"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I am neurodiverse</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_disability"
                value="disability"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I have a disability or chronic health condition</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="background_other_barriers"
                value="other_barriers"
                className="w-4 h-4 mt-0.5 text-cyan border-border rounded focus:ring-cyan"
              />
              <span className="text-sm text-body">I face other barriers to attending (please specify in pitch)</span>
            </label>
          </div>
        </div>

        {/* Scholarship Pitch */}
        <div>
          <label htmlFor="whyAttend" className="block text-sm font-bold text-navy mb-2">
            Scholarship pitch *
          </label>
          <p className="text-sm text-muted mb-2">
            Tell us how attending the forum would support your work and why a scholarship would make a difference for you. (Around 150 words)
          </p>
          <textarea
            id="whyAttend"
            name="whyAttend"
            required
            maxLength={900}
            rows={5}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Travel Support Section Header */}
        <div className="border-b-2 border-navy pb-2 pt-2">
          <h3 className="font-bold text-lg text-navy">Travel Support</h3>
        </div>

        {/* Travel Support */}
        <div>
          <label className="block text-sm font-bold text-navy mb-3">
            Would travel support help you attend? *
          </label>
          <p className="text-sm text-muted mb-3">
            We have limited funding available. Let us know if support would make a difference, or if you just need the free registration.
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
                No thanks, I just need the free registration
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
                Yes, I&apos;d need travel support to attend
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
              name="travelEstimate"
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
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </form>
  );
}
