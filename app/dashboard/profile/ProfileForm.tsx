'use client';

import { useState } from 'react';
import AvatarUpload from '@/components/AvatarUpload';
import DietaryCombobox from '@/components/DietaryCombobox';
import SocialLinkInput from '@/components/SocialLinkInput';
import { updateProfile, updateAvatar } from '@/lib/profile-actions';

interface ProfileFormProps {
  email: string;
  initialData?: {
    name: string;
    gender: string;
    title: string;
    organisation: string;
    bio: string;
    linkedin: string;
    twitter: string;
    bluesky: string;
    website: string;
    dietaryRequirements: string;
    avatarUrl: string;
  };
}

export default function ProfileForm({ email, initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatarUrl || null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);

    const data = {
      name: formData.get('name') as string,
      gender: formData.get('gender') as string,
      title: formData.get('title') as string,
      organisation: formData.get('organisation') as string,
      bio: formData.get('bio') as string,
      linkedin: formData.get('linkedin') as string,
      twitter: formData.get('twitter') as string,
      bluesky: formData.get('bluesky') as string,
      website: formData.get('website') as string,
      dietaryRequirements: formData.get('dietaryRequirements') as string,
    };

    const result = await updateProfile(email, data);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error || 'An error occurred');
    }

    setIsSubmitting(false);
  }

  async function handleAvatarUpload(url: string) {
    setAvatarUrl(url);
    // Save avatar URL immediately
    const result = await updateAvatar(email, url);
    if (!result.success) {
      setError(result.error || 'Failed to save avatar');
    }
  }

  async function handleAvatarRemove() {
    setAvatarUrl(null);
    // Remove avatar URL immediately
    const result = await updateAvatar(email, null);
    if (!result.success) {
      setError(result.error || 'Failed to remove avatar');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-border">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-medium">Saved!</p>
          <p className="text-sm">Your profile has been updated.</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-bold text-navy mb-3">
            Profile Photo
          </label>
          <AvatarUpload
            email={email}
            name={initialData?.name}
            currentAvatarUrl={avatarUrl}
            onUploadComplete={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-bold text-navy mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2 border border-border rounded-md bg-light text-muted"
          />
          <p className="text-xs text-muted mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-navy mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={initialData?.name}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-bold text-navy mb-2">
            Gender
          </label>
          <p className="text-xs text-muted mb-2">
            Optional — helps us understand our community and work toward gender balance
          </p>
          <select
            id="gender"
            name="gender"
            defaultValue={initialData?.gender || ''}
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          >
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-navy mb-2">
            Job Title / Role
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={initialData?.title}
            placeholder="e.g. Research Fellow, Policy Analyst"
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Organisation */}
        <div>
          <label htmlFor="organisation" className="block text-sm font-bold text-navy mb-2">
            Organisation
          </label>
          <input
            type="text"
            id="organisation"
            name="organisation"
            defaultValue={initialData?.organisation}
            placeholder="e.g. Australian National University"
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-bold text-navy mb-2">
            Bio
          </label>
          <p className="text-sm text-muted mb-2">
            A short description about yourself (around 75 words)
          </p>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initialData?.bio}
            rows={4}
            maxLength={450}
            placeholder="Your background, research interests, or current work..."
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
          />
        </div>

        {/* Dietary Requirements */}
        <div>
          <label htmlFor="dietaryRequirements" className="block text-sm font-bold text-navy mb-2">
            Dietary Requirements
          </label>
          <p className="text-xs text-muted mb-2">
            Optional — let us know about any dietary needs for catering
          </p>
          <DietaryCombobox
            id="dietaryRequirements"
            name="dietaryRequirements"
            defaultValue={initialData?.dietaryRequirements}
          />
        </div>

        {/* Profile Links Section */}
        <div className="border-t border-border pt-6">
          <h3 className="font-bold text-navy mb-4">Profile Links</h3>
          <p className="text-sm text-muted mb-4">
            Optional - add your professional profiles
          </p>
          <div className="space-y-4">
            <SocialLinkInput
              type="linkedin"
              id="linkedin"
              name="linkedin"
              label="LinkedIn"
              defaultValue={initialData?.linkedin}
            />
            <SocialLinkInput
              type="twitter"
              id="twitter"
              name="twitter"
              label="X / Twitter"
              defaultValue={initialData?.twitter}
            />
            <SocialLinkInput
              type="bluesky"
              id="bluesky"
              name="bluesky"
              label="Bluesky"
              defaultValue={initialData?.bluesky}
            />
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-body mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                defaultValue={initialData?.website}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-3 text-base font-bold bg-navy text-white rounded-md hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
