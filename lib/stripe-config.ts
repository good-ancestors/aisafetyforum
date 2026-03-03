// Stripe product configuration
// Note: These prices include GST (10%)

// Early bird deadline (ISO date format)
export const earlyBirdDeadline = '2026-04-01';

// Helper to check if early bird pricing is active
export function isEarlyBirdActive(): boolean {
  const now = new Date();
  const deadline = new Date(earlyBirdDeadline);
  return now < deadline;
}

export const ticketTiers = [
  {
    id: 'standard',
    name: 'Standard (Industry/Professional/Government)',
    description: 'For industry professionals, corporate attendees, and government employees',
    price: 59500, // Price in cents (AUD)
    priceDisplay: '$595',
    earlyBirdPrice: 35700, // 40% off = $357
    earlyBirdPriceDisplay: '$357',
    stripePriceId: process.env.STRIPE_PRICE_STANDARD || '',
    stripeEarlyBirdPriceId: process.env.STRIPE_PRICE_STANDARD_EARLYBIRD || '',
    borderColor: 'border-brand-blue',
    textColor: 'text-brand-blue',
  },
  {
    id: 'academic',
    name: 'Academic / Non-Profit',
    description: 'For academics and non-profit organisations',
    price: 24500, // Price in cents (AUD)
    priceDisplay: '$245',
    earlyBirdPrice: 14700, // 40% off = $147
    earlyBirdPriceDisplay: '$147',
    stripePriceId: process.env.STRIPE_PRICE_ACADEMIC || '',
    stripeEarlyBirdPriceId: process.env.STRIPE_PRICE_ACADEMIC_EARLYBIRD || '',
    borderColor: 'border-teal',
    textColor: 'text-teal',
  },
  {
    id: 'concession',
    name: 'Concession',
    description: 'Students, unwaged, or independent researchers',
    price: 7500, // Price in cents (AUD)
    priceDisplay: '$75',
    earlyBirdPrice: 4500, // 40% off = $45
    earlyBirdPriceDisplay: '$45',
    stripePriceId: process.env.STRIPE_PRICE_CONCESSION || '',
    stripeEarlyBirdPriceId: process.env.STRIPE_PRICE_CONCESSION_EARLYBIRD || '',
    borderColor: 'border-cyan',
    textColor: 'text-cyan',
  },
] as const;

export type TicketTierId = typeof ticketTiers[number]['id'];
