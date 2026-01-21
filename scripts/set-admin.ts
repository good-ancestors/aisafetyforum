#!/usr/bin/env tsx

/**
 * Utility script to set a user as admin
 *
 * Usage:
 *   npx tsx scripts/set-admin.ts admin@example.com
 *   npx tsx scripts/set-admin.ts admin@example.com --remove
 *
 * Or add to package.json:
 *   "scripts": {
 *     "set-admin": "tsx scripts/set-admin.ts"
 *   }
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const shouldRemove = args.includes('--remove');

  if (!email) {
    console.error('Usage: npx tsx scripts/set-admin.ts <email> [--remove]');
    console.error('');
    console.error('Examples:');
    console.error('  npx tsx scripts/set-admin.ts admin@example.com        # Grant admin');
    console.error('  npx tsx scripts/set-admin.ts admin@example.com --remove  # Revoke admin');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase();

  // Check if profile exists
  const existingProfile = await prisma.profile.findUnique({
    where: { email: normalizedEmail },
  });

  if (!existingProfile) {
    // Create a new profile with admin flag
    const profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        isAdmin: !shouldRemove,
      },
    });
    console.log(`✓ Created new profile for ${normalizedEmail}`);
    console.log(`  Admin status: ${profile.isAdmin ? 'granted' : 'not granted'}`);
  } else {
    // Update existing profile
    const profile = await prisma.profile.update({
      where: { email: normalizedEmail },
      data: { isAdmin: !shouldRemove },
    });
    console.log(`✓ Updated profile for ${normalizedEmail}`);
    console.log(`  Admin status: ${profile.isAdmin ? 'granted' : 'revoked'}`);
  }

  // List all admins
  const admins = await prisma.profile.findMany({
    where: { isAdmin: true },
    select: { email: true, name: true },
  });

  console.log('\nCurrent admins:');
  if (admins.length === 0) {
    console.log('  (none)');
  } else {
    admins.forEach((admin) => {
      console.log(`  - ${admin.email}${admin.name ? ` (${admin.name})` : ''}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
