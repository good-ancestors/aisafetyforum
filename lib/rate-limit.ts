/**
 * Simple in-memory rate limiter for API routes
 *
 * IMPORTANT: This is a per-instance rate limiter. On Vercel with multiple
 * serverless function instances, rate limits are NOT shared across instances.
 * This means:
 * - A user could potentially exceed limits by hitting different instances
 * - The effective rate limit is (configured limit × number of instances)
 *
 * For MVP launch, this provides basic protection against abuse. For stricter
 * rate limiting, consider upgrading to:
 * - Vercel KV (https://vercel.com/docs/storage/vercel-kv)
 * - Upstash Redis (@upstash/ratelimit package)
 *
 * The current implementation is still valuable for:
 * - Protecting against rapid-fire requests to a single instance
 * - Basic abuse prevention
 * - Development and testing
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetTime < now) {
    // No entry or expired - create new window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitMap.set(key, newEntry);
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request headers
 * Falls back to a generic identifier if no IP is available
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// Preset configurations
export const rateLimitPresets = {
  /** Standard API route: 60 requests per minute */
  standard: { limit: 60, windowMs: 60 * 1000 },
  /** Strict rate limit: 10 requests per minute */
  strict: { limit: 10, windowMs: 60 * 1000 },
  /** Webhook rate limit: 100 requests per minute (for Stripe webhooks) */
  webhook: { limit: 100, windowMs: 60 * 1000 },
  /** Document generation: 20 requests per minute */
  document: { limit: 20, windowMs: 60 * 1000 },
} as const;
