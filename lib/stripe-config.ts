// Stripe product configuration
// Note: These prices include GST (10%)

export const ticketTiers = [
  {
    id: 'standard',
    name: 'Standard (Industry/Professional)',
    description: 'For industry professionals and corporate attendees',
    price: 59500, // Price in cents (AUD)
    priceDisplay: '$595',
    stripePriceId: process.env.STRIPE_PRICE_STANDARD || '', // Set in .env
    borderColor: 'border-[#0047ba]',
    textColor: 'text-[#0047ba]',
  },
  {
    id: 'academic',
    name: 'Academic / Non-Profit / Government',
    description: 'For academics, non-profit organizations, and government employees',
    price: 24500, // Price in cents (AUD)
    priceDisplay: '$245',
    stripePriceId: process.env.STRIPE_PRICE_ACADEMIC || '', // Set in .env
    borderColor: 'border-[#0099cc]',
    textColor: 'text-[#0099cc]',
  },
  {
    id: 'concession',
    name: 'Concession',
    description: 'Students, unwaged, or independent researchers',
    price: 7500, // Price in cents (AUD)
    priceDisplay: '$75',
    stripePriceId: process.env.STRIPE_PRICE_CONCESSION || '', // Set in .env
    borderColor: 'border-[#00d4ff]',
    textColor: 'text-[#00d4ff]',
  },
] as const;

export type TicketTierId = typeof ticketTiers[number]['id'];
