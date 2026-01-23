#!/usr/bin/env tsx

/**
 * Setup test data for local development and testing
 *
 * Usage:
 *   npx tsx scripts/setup-test-data.ts
 */

import 'dotenv/config';
import { addFreeTicketEmail } from '../lib/free-ticket-actions';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧪 Setting up test data...\n');

  // 1. Create test coupon codes
  console.log('Creating test coupon codes...');

  try {
    await prisma.discountCode.create({
      data: {
        code: 'TEST50',
        description: 'Test coupon - 50% off',
        type: 'percentage',
        value: 50,
        validFor: [],
        allowedEmails: [],
        maxUses: null,
        active: true,
      },
    });
    console.log('✓ Created TEST50: 50% off any ticket');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ TEST50 already exists');
    } else {
      throw e;
    }
  }

  try {
    await prisma.discountCode.create({
      data: {
        code: 'TESTFREE',
        description: 'Test coupon - Free ticket',
        type: 'free',
        value: 100,
        validFor: [],
        allowedEmails: [],
        maxUses: null,
        active: true,
      },
    });
    console.log('✓ Created TESTFREE: 100% off (free ticket)');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ TESTFREE already exists');
    } else {
      throw e;
    }
  }

  try {
    await prisma.discountCode.create({
      data: {
        code: 'TEST20',
        description: 'Test coupon - $20 off',
        type: 'fixed',
        value: 2000, // $20 in cents
        validFor: [],
        allowedEmails: [],
        maxUses: null,
        active: true,
      },
    });
    console.log('✓ Created TEST20: $20 off any ticket');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ TEST20 already exists');
    } else {
      throw e;
    }
  }

  // 2. Create test free ticket emails
  console.log('\nCreating test free ticket emails...');

  try {
    await addFreeTicketEmail('test@example.com', 'Test user for development');
    console.log('✓ Added test@example.com');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ test@example.com already exists');
    } else {
      throw e;
    }
  }

  try {
    await addFreeTicketEmail('speaker@example.com', 'Test speaker');
    console.log('✓ Added speaker@example.com');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ speaker@example.com already exists');
    } else {
      throw e;
    }
  }

  try {
    await addFreeTicketEmail('vip@example.com', 'Test VIP');
    console.log('✓ Added vip@example.com');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      console.log('✓ vip@example.com already exists');
    } else {
      throw e;
    }
  }

  console.log('\n✅ Test data setup complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 TEST COUPON CODES');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Code: TEST50');
  console.log('  → 50% discount on any ticket type');
  console.log('  → Valid for any email\n');

  console.log('Code: TESTFREE');
  console.log('  → 100% discount (free ticket)');
  console.log('  → Valid for any email\n');

  console.log('Code: TEST20');
  console.log('  → $20 off any ticket type');
  console.log('  → Valid for any email\n');

  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 TEST FREE TICKET EMAILS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Email: test@example.com');
  console.log('  → Automatically gets free ticket (no code needed)');
  console.log('  → Reason: "Test user for development"\n');

  console.log('Email: speaker@example.com');
  console.log('  → Automatically gets free ticket (no code needed)');
  console.log('  → Reason: "Test speaker"\n');

  console.log('Email: vip@example.com');
  console.log('  → Automatically gets free ticket (no code needed)');
  console.log('  → Reason: "Test VIP"\n');

  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 HOW TO TEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('1. Testing coupon codes:');
  console.log('   • Go to /register');
  console.log('   • Fill in any email');
  console.log('   • Enter TEST50, TESTFREE, or TEST20');
  console.log('   • Click "Apply" to see discount\n');

  console.log('2. Testing email-based free tickets:');
  console.log('   • Go to /register');
  console.log('   • Enter test@example.com, speaker@example.com, or vip@example.com');
  console.log('   • Tab out of email field');
  console.log('   • See green "Complimentary registration!" message\n');

  console.log('3. Testing full registration flow:');
  console.log('   • Complete the form with test data');
  console.log('   • Free tickets bypass Stripe and go straight to success page');
  console.log('   • Paid/discounted tickets go to Stripe checkout');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('Error setting up test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
