#!/usr/bin/env tsx

/**
 * Utility script to create discount codes
 *
 * Usage:
 *   npx tsx scripts/create-coupon.ts
 *
 * Or add to package.json:
 *   "scripts": {
 *     "create-coupon": "tsx scripts/create-coupon.ts"
 *   }
 */

import { prisma } from '../lib/prisma';

async function main() {
  console.log('Creating discount codes...\n');

  // Example 1: Create a 100% discount for speakers
  const speakerCode = await prisma.discountCode.create({
    data: {
      code: 'SPEAKER2026',
      description: 'Complimentary ticket for accepted speakers',
      type: 'free',
      value: 100,
      validFor: [], // Valid for all ticket types
      allowedEmails: [], // Will be populated with speaker emails
      maxUses: null, // Unlimited uses
      active: true,
    },
  });
  console.log('✓ Created speaker code:', speakerCode.code);

  // Example 2: Create a 50% early bird discount
  const earlyBirdCode = await prisma.discountCode.create({
    data: {
      code: 'EARLYBIRD2026',
      description: 'Early bird discount - 50% off',
      type: 'percentage',
      value: 50,
      validFor: ['standard', 'academic'],
      allowedEmails: [],
      maxUses: 100,
      validUntil: new Date('2026-03-31'), // Expires end of March
      active: true,
    },
  });
  console.log('✓ Created early bird code:', earlyBirdCode.code);

  // Example 3: Create a fixed dollar discount
  const groupCode = await prisma.discountCode.create({
    data: {
      code: 'GROUP50',
      description: '$50 discount for group bookings',
      type: 'fixed',
      value: 5000, // $50 in cents
      validFor: [],
      allowedEmails: [],
      maxUses: 50,
      active: true,
    },
  });
  console.log('✓ Created group discount code:', groupCode.code);

  // Example 4: Create email-specific complimentary tickets for organizers
  const organizerCode = await prisma.discountCode.create({
    data: {
      code: 'ORGANIZER2026',
      description: 'Complimentary ticket for organizers',
      type: 'free',
      value: 100,
      validFor: [],
      allowedEmails: [
        'organizer@example.com',
        // Add more organizer emails here
      ],
      maxUses: null,
      active: true,
    },
  });
  console.log('✓ Created organizer code:', organizerCode.code);

  console.log('\n✅ All discount codes created successfully!');
  console.log('\nCreated codes:');
  console.log('- SPEAKER2026: Free tickets for accepted speakers');
  console.log('- EARLYBIRD2026: 50% off until March 31, 2026');
  console.log('- GROUP50: $50 off for any ticket');
  console.log('- ORGANIZER2026: Free tickets for specific organizer emails');
}

main()
  .catch((e) => {
    console.error('Error creating discount codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
