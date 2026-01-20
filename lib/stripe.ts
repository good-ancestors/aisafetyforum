import Stripe from 'stripe';

/**
 * Stripe client singleton (lazy-initialized).
 *
 * The Stripe client is created on first use to avoid build-time errors
 * when environment variables aren't available during static analysis.
 *
 * In development, you can set SKIP_STRIPE_VALIDATION=true to test non-payment features.
 */

let stripeInstance: Stripe | null = null;
let stripeInitialized = false;

function getStripeClient(): Stripe | null {
  if (stripeInitialized) {
    return stripeInstance;
  }

  stripeInitialized = true;

  if (process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }

  return stripeInstance;
}

// Export getter for backwards compatibility (returns null if not configured)
export const stripe = null as Stripe | null; // Type hint only, use requireStripe() instead

/**
 * Helper to ensure Stripe is configured before use.
 * Call this at the start of any function that needs Stripe.
 */
export function requireStripe(): Stripe {
  const client = getStripeClient();
  if (!client) {
    const shouldSkipValidation = process.env.SKIP_STRIPE_VALIDATION === 'true';
    if (shouldSkipValidation) {
      throw new Error(
        'Stripe is not configured. This feature requires STRIPE_SECRET_KEY to be set.'
      );
    }
    throw new Error(
      'STRIPE_SECRET_KEY is not set in environment variables. ' +
      'For local development without Stripe, set SKIP_STRIPE_VALIDATION=true in .env'
    );
  }
  return client;
}
