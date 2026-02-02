/**
 * Social link utilities for handling profiles
 *
 * We store just the handle/username in the database, not full URLs.
 * This makes data cleaner and easier to work with in the UI.
 */

export type SocialPlatform = 'linkedin' | 'twitter' | 'bluesky';

interface SocialConfig {
  prefix: string;
  urlPrefix: string;
  extractPattern: RegExp;
  validatePattern: RegExp;
}

const socialConfigs: Record<SocialPlatform, SocialConfig> = {
  linkedin: {
    prefix: 'linkedin.com/in/',
    urlPrefix: 'https://linkedin.com/in/',
    extractPattern:
      /(?:https?:\/\/)?(?:www\.)?(?:[a-z]{2}\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/,
    validatePattern: /^[a-zA-Z0-9_-]+$/,
  },
  twitter: {
    prefix: 'x.com/',
    urlPrefix: 'https://x.com/',
    extractPattern:
      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:@)?([a-zA-Z0-9_]+)\/?/,
    validatePattern: /^@?[a-zA-Z0-9_]+$/,
  },
  bluesky: {
    prefix: 'bsky.app/profile/',
    urlPrefix: 'https://bsky.app/profile/',
    extractPattern:
      /(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/([a-zA-Z0-9._-]+)\/?/,
    validatePattern: /^[a-zA-Z0-9._-]+$/,
  },
};

/**
 * Extract handle from a value that might be a full URL or just a handle.
 * Returns empty string if input is empty/null.
 */
export function extractHandle(
  value: string | null | undefined,
  platform: SocialPlatform
): string {
  if (!value) return '';

  const config = socialConfigs[platform];
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

  // Return as-is if we can't parse it (might be a custom format)
  return trimmed;
}

/**
 * Convert a handle to a full URL for display/linking.
 * Returns null if handle is empty.
 */
export function getSocialUrl(
  handle: string | null | undefined,
  platform: SocialPlatform
): string | null {
  if (!handle) return null;
  const config = socialConfigs[platform];
  return `${config.urlPrefix}${handle}`;
}

/**
 * Get the display prefix for a platform (used in UI).
 */
export function getSocialPrefix(platform: SocialPlatform): string {
  return socialConfigs[platform].prefix;
}

/**
 * Normalize a social link value for storage.
 * Accepts either a full URL or just a handle, returns just the handle.
 */
export function normalizeSocialHandle(
  value: string | null | undefined,
  platform: SocialPlatform
): string {
  return extractHandle(value, platform);
}
