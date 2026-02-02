'use client';

import { useState, useCallback } from 'react';

interface SocialLinkConfig {
  prefix: string;
  placeholder: string;
  // Pattern to extract handle from full URL
  extractPattern: RegExp;
  // Valid handle pattern
  validatePattern: RegExp;
}

const socialConfigs: Record<string, SocialLinkConfig> = {
  linkedin: {
    prefix: 'linkedin.com/in/',
    placeholder: 'yourname',
    extractPattern: /(?:https?:\/\/)?(?:www\.)?(?:[a-z]{2}\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/,
    validatePattern: /^[a-zA-Z0-9_-]+$/,
  },
  twitter: {
    prefix: 'x.com/',
    placeholder: 'yourhandle',
    extractPattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:@)?([a-zA-Z0-9_]+)\/?/,
    validatePattern: /^@?[a-zA-Z0-9_]+$/,
  },
  bluesky: {
    prefix: 'bsky.app/profile/',
    placeholder: 'yourhandle.bsky.social',
    extractPattern: /(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/([a-zA-Z0-9._-]+)\/?/,
    validatePattern: /^[a-zA-Z0-9._-]+$/,
  },
};

interface SocialLinkInputProps {
  type: 'linkedin' | 'twitter' | 'bluesky';
  name: string;
  id: string;
  defaultValue?: string;
  label: string;
}

/**
 * Extract handle from a value that might be a full URL or just a handle
 */
function extractHandle(value: string, config: SocialLinkConfig): string {
  if (!value) return '';

  const trimmed = value.trim();

  // Try to extract from URL
  const match = trimmed.match(config.extractPattern);
  if (match && match[1]) {
    return match[1].replace(/^@/, ''); // Remove leading @ if present
  }

  // If it looks like just a handle, clean it up
  const cleanHandle = trimmed.replace(/^@/, '').replace(/\/$/, '');
  if (config.validatePattern.test(cleanHandle)) {
    return cleanHandle;
  }

  // Return as-is if we can't parse it
  return trimmed;
}

/**
 * Convert handle to full URL for storage
 */
function handleToUrl(handle: string, config: SocialLinkConfig): string {
  if (!handle) return '';
  return `https://${config.prefix}${handle}`;
}

/**
 * Extract handle from stored URL
 */
function urlToHandle(url: string, config: SocialLinkConfig): string {
  if (!url) return '';
  return extractHandle(url, config);
}

export default function SocialLinkInput({
  type,
  name,
  id,
  defaultValue,
  label,
}: SocialLinkInputProps) {
  const config = socialConfigs[type];
  const [handle, setHandle] = useState(() => urlToHandle(defaultValue || '', config));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Extract handle on every change (handles paste)
    const extracted = extractHandle(value, config);
    setHandle(extracted);
  }, [config]);

  const handleBlur = useCallback(() => {
    // Clean up on blur
    const cleaned = extractHandle(handle, config);
    setHandle(cleaned);
  }, [handle, config]);

  // Hidden input stores the full URL
  const fullUrl = handle ? handleToUrl(handle, config) : '';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-body mb-1">
        {label}
      </label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-muted bg-light border border-r-0 border-border rounded-l-md">
          {config.prefix}
        </span>
        <input
          type="text"
          id={id}
          value={handle}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={config.placeholder}
          className="flex-1 px-3 py-2 border border-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent text-sm"
        />
        {/* Hidden input for form submission with full URL */}
        <input type="hidden" name={name} value={fullUrl} />
      </div>
    </div>
  );
}
