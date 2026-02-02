'use client';

import { useState, useCallback } from 'react';
import {
  extractHandle,
  getSocialPrefix,
  type SocialPlatform,
} from '@/lib/social-links';

interface SocialLinkInputProps {
  type: SocialPlatform;
  name: string;
  id: string;
  defaultValue?: string;
  label: string;
}

export default function SocialLinkInput({
  type,
  name,
  id,
  defaultValue,
  label,
}: SocialLinkInputProps) {
  // Extract handle from default value (handles both URLs and plain handles)
  const [handle, setHandle] = useState(() => extractHandle(defaultValue, type));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Extract handle on every change (handles paste of full URLs)
      const extracted = extractHandle(value, type);
      setHandle(extracted);
    },
    [type]
  );

  const handleBlur = useCallback(() => {
    // Clean up on blur
    const cleaned = extractHandle(handle, type);
    setHandle(cleaned);
  }, [handle, type]);

  const prefix = getSocialPrefix(type);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body mb-1">
        {label}
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-muted bg-light border border-r-0 border-border rounded-l-md">
          {prefix}
        </span>
        <input
          type="text"
          id={id}
          value={handle}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={type === 'bluesky' ? 'yourhandle.bsky.social' : 'yourhandle'}
          className="flex-1 px-3 py-2 border border-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
        />
        {/* Hidden input stores just the handle */}
        <input type="hidden" name={name} value={handle} />
      </div>
    </div>
  );
}
