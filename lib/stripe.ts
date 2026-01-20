import Stripe from 'stripe';

/**
 * Stripe client singleton.
 *
 * In production, this will throw immediately if STRIPE_SECRET_KEY is not set.
 * In development, you can set SKIP_STRIPE_VALIDATION=true to test non-payment features.
 *
 * This is "fail-fast" by default, which catches configuration issues early.
 */

const shouldSkipValidation = process.env.SKIP_STRIPE_VALIDATION === 'true';

if (!process.env.STRIPE_SECRET_KEY && !shouldSkipValidation) {
  throw new Error(
    'STRIPE_SECRET_KEY is not set in environment variables. ' +
    'For local development without Stripe, set SKIP_STRIPE_VALIDATION=true in .env'
  );
}

// Export null if skipping validation (dev only), otherwise initialize Stripe
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

/**
 * Helper to ensure Stripe is configured before use.
 * Call this at the start of any function that needs Stripe.
 */
export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe is not configured. This feature requires STRIPE_SECRET_KEY to be set.'
    );
  }
  return stripe;
}
