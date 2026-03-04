// Stripe product configuration
// Note: These prices include GST (10%)

// Early bird coupon code — auto-applied at checkout before the deadline.
// The actual discount % and expiry are managed via the DiscountCode table;
// this constant is only used by the UI to show / pre-fill the code.
export const earlyBirdCouponCode = 'EARLYBIRD';

// Deadline used only for the UI banner ("Register before …").
// The coupon's validUntil in the database is the source of truth for enforcement.
export const earlyBirdDeadline = '2026-04-01';

export const ticketTiers = [
  {
    id: 'standard',
    name: 'Standard (Industry/Professional/Government)',
    description: 'For industry professionals, corporate attendees, and government employees',
    price: 59500, // Price in cents (AUD)
    priceDisplay: '$595',
    stripePriceId: process.env.STRIPE_PRICE_STANDARD || '',
    borderColor: 'border-brand-blue',
    textColor: 'text-brand-blue',
  },
  {
    id: 'academic',
    name: 'Academic / Non-Profit',
    description: 'For academics and non-profit organisations',
    price: 24500, // Price in cents (AUD)
    priceDisplay: '$245',
    stripePriceId: process.env.STRIPE_PRICE_ACADEMIC || '',
    borderColor: 'border-teal',
    textColor: 'text-teal',
  },
  {
    id: 'concession',
    name: 'Concession',
    description: 'Students, unwaged, or independent researchers',
    price: 7500, // Price in cents (AUD)
    priceDisplay: '$75',
    stripePriceId: process.env.STRIPE_PRICE_CONCESSION || '',
    borderColor: 'border-cyan',
    textColor: 'text-cyan',
  },
] as const;

export type TicketTierId = typeof ticketTiers[number]['id'];
