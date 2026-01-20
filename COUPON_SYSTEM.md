# Discount & Coupon Code System

Complete guide to managing discount codes, complimentary tickets, and email-based access control for the Australian AI Safety Forum registration system.

## Overview

The system supports two ways to provide free/discounted tickets:

### 1. Coupon Codes
Users enter a code during registration for:
- **Percentage discounts** (e.g., 50% off)
- **Fixed amount discounts** (e.g., $50 off)
- **Free/Complimentary tickets** (100% discount)

Advanced features:
- Email allowlists (codes only work for specific emails)
- Ticket type restrictions (e.g., only valid for academic tickets)
- Usage limits (single-use, multi-use, or unlimited)
- Date validity windows

### 2. Email-Based Free Tickets
Automatic free ticket detection based on email address alone (no code required):
- User enters their email during registration
- System automatically checks if email is on the free ticket list
- If found, user gets complimentary registration with custom reason displayed
- Perfect for speakers, VIPs, organizers, and other privileged attendees

## Database Schema

```prisma
model DiscountCode {
  id              String         // Unique ID
  code            String         // Coupon code (e.g., "SPEAKER2026")
  description     String         // Human-readable description
  type            String         // "percentage", "fixed", or "free"
  value           Int            // Percentage (0-100) or cents amount
  validFor        String[]       // [] = all, or ["standard", "academic", "concession"]
  allowedEmails   String[]       // [] = any email, or specific emails
  maxUses         Int?           // null = unlimited, or max number of uses
  currentUses     Int            // Tracks how many times code has been used
  active          Boolean        // Can be toggled on/off
  validFrom       DateTime?      // Start date (null = immediately valid)
  validUntil      DateTime?      // Expiry date (null = never expires)
  registrations   Registration[] // All registrations using this code
}

model FreeTicketEmail {
  id          String   // Unique ID
  email       String   // Email address (unique, case-insensitive)
  reason      String   // Why they get free access (e.g., "Accepted speaker")
  active      Boolean  // Can be toggled on/off
  notified    Boolean  // Whether person has been notified
  createdAt   DateTime
  updatedAt   DateTime
}
```

## Use Cases

### Email-Based Free Tickets (Recommended for VIPs)

**Scenario**: Give specific people automatic free tickets without requiring a coupon code

This is the **preferred method** for speakers, organizers, VIPs, and other privileged attendees because:
- ✅ No code needed - just enter email and it's automatically detected
- ✅ Can't be shared or leaked (tied to specific email)
- ✅ Cleaner UX - users don't need to know a code
- ✅ Easy to manage - add/remove emails as needed

#### Example 1: Free Tickets for Accepted Speakers

```typescript
import { addFreeTicketEmail } from '@/lib/free-ticket-actions';

// Add individual speaker
await addFreeTicketEmail(
  'speaker@example.com',
  'Accepted speaker for 2026 Forum'
);

// Or add multiple speakers at once
import { addBulkFreeTicketEmails } from '@/lib/free-ticket-actions';

const speakers = [
  'speaker1@example.com',
  'speaker2@example.com',
  'speaker3@example.com',
];

await addBulkFreeTicketEmails(
  speakers,
  'Accepted speaker for 2026 Forum'
);
```

#### Example 2: Free Tickets for Organizers/VIPs

```typescript
await addFreeTicketEmail(
  'organizer@example.com',
  'Organizing committee member'
);

await addFreeTicketEmail(
  'vip@example.com',
  'VIP guest'
);
```

#### Example 3: List All Free Ticket Emails

```typescript
import { listFreeTicketEmails } from '@/lib/free-ticket-actions';

const freeEmails = await listFreeTicketEmails();
console.log(freeEmails);
```

#### Example 4: Deactivate/Remove Free Ticket

```typescript
import { deactivateFreeTicketEmail, removeFreeTicketEmail } from '@/lib/free-ticket-actions';

// Temporarily deactivate (can reactivate later)
await deactivateFreeTicketEmail('speaker@example.com');

// Permanently remove
await removeFreeTicketEmail('speaker@example.com');
```

### Coupon-Based Free Tickets

Use coupon codes when:
- You want a shareable code (e.g., early bird discount)
- You need usage limits
- You want to track a group without listing individual emails
- You need time-based validity

### 1. Free Tickets for Speakers (Using Coupons)

**Scenario**: Accepted speakers get complimentary registration

```typescript
{
  code: "SPEAKER2026",
  description: "Complimentary ticket for accepted speakers",
  type: "free",
  value: 100,
  validFor: [],           // Works for any ticket type
  allowedEmails: [],      // Initially empty, add speaker emails as they're accepted
  maxUses: null,          // Unlimited - speakers can re-register if needed
  active: true,
}
```

**How to add speaker emails**:
```typescript
await prisma.discountCode.update({
  where: { code: "SPEAKER2026" },
  data: {
    allowedEmails: {
      push: "speaker@example.com"  // Add one email
    }
  }
});
```

Or add multiple emails at once:
```typescript
const speakers = ["speaker1@example.com", "speaker2@example.com"];
await prisma.discountCode.update({
  where: { code: "SPEAKER2026" },
  data: {
    allowedEmails: speakers
  }
});
```

### 2. Free Tickets for Specific People (VIP/Organizers)

**Scenario**: Give specific people free tickets by email

```typescript
{
  code: "ORGANIZER2026",
  description: "Complimentary ticket for organizing committee",
  type: "free",
  value: 100,
  validFor: [],
  allowedEmails: [
    "organizer1@example.com",
    "organizer2@example.com",
    "vip@example.com"
  ],
  maxUses: null,          // Can be reused by allowed emails
  active: true,
}
```

### 3. Early Bird Discount

**Scenario**: 50% off for first 100 registrations before March 31

```typescript
{
  code: "EARLYBIRD2026",
  description: "Early bird discount - 50% off",
  type: "percentage",
  value: 50,
  validFor: ["standard", "academic"],  // Not valid for concession tickets
  allowedEmails: [],                    // Anyone can use it
  maxUses: 100,                         // Limited to 100 uses
  validUntil: new Date("2026-03-31"),  // Expires end of March
  active: true,
}
```

### 4. Fixed Amount Group Discount

**Scenario**: $50 off for group bookings

```typescript
{
  code: "GROUP50",
  description: "$50 group booking discount",
  type: "fixed",
  value: 5000,            // $50 in cents
  validFor: [],
  allowedEmails: [],
  maxUses: 50,            // 50 people can use it
  active: true,
}
```

### 5. Partner Organization Discount

**Scenario**: 30% discount for members of partner organizations

```typescript
{
  code: "PARTNER2026",
  description: "30% discount for partner organizations",
  type: "percentage",
  value: 30,
  validFor: [],
  allowedEmails: [],      // Could restrict to specific domains if needed
  maxUses: null,
  validFrom: new Date("2026-01-01"),
  validUntil: new Date("2026-06-15"),
  active: true,
}
```

## Creating Discount Codes

### Method 1: Using the Script

1. Edit `scripts/create-coupon.ts` with your desired codes
2. Run: `npx tsx scripts/create-coupon.ts`

### Method 2: Using Prisma Studio

1. Run: `npx prisma studio`
2. Navigate to `DiscountCode` model
3. Click "Add record"
4. Fill in the fields
5. Click "Save"

### Method 3: Programmatically

```typescript
import { createDiscountCode } from '@/lib/coupon-actions';

const result = await createDiscountCode({
  code: "MYCODE2026",
  description: "My custom discount",
  type: "percentage",
  value: 25,
  validFor: ["standard"],
  allowedEmails: [],
  maxUses: 50,
  validUntil: new Date("2026-06-01"),
});
```

## Managing Discount Codes

### View All Codes

```typescript
import { listDiscountCodes } from '@/lib/coupon-actions';

const codes = await listDiscountCodes();
console.log(codes);
```

### Update a Code

```typescript
await prisma.discountCode.update({
  where: { code: "EARLYBIRD2026" },
  data: {
    active: false,  // Deactivate the code
  }
});
```

### Add Emails to Existing Code

```typescript
// Add single email
await prisma.discountCode.update({
  where: { code: "SPEAKER2026" },
  data: {
    allowedEmails: {
      push: "newspeaker@example.com"
    }
  }
});

// Replace all emails
const newEmails = ["email1@example.com", "email2@example.com"];
await prisma.discountCode.update({
  where: { code: "SPEAKER2026" },
  data: {
    allowedEmails: newEmails
  }
});
```

### Increase Usage Limit

```typescript
await prisma.discountCode.update({
  where: { code: "EARLYBIRD2026" },
  data: {
    maxUses: 200  // Increase from 100 to 200
  }
});
```

### Extend Expiry Date

```typescript
await prisma.discountCode.update({
  where: { code: "EARLYBIRD2026" },
  data: {
    validUntil: new Date("2026-04-30")  // Extend by a month
  }
});
```

## How Users Apply Discounts

### Email-Based Free Tickets (Automatic)

1. User enters their email address
2. System automatically checks if email is on free ticket list (on blur)
3. If found, a green notification appears: "Complimentary registration! [reason]"
4. User completes rest of form (name, organization, ticket type)
5. The coupon code field is hidden (not needed)
6. User clicks "Proceed to Payment"
7. Since ticket is free, user goes directly to success page without Stripe checkout

### Coupon Codes (Manual)

1. User fills in email, name, and selects ticket type
2. User enters coupon code in the "Have a coupon code?" field
3. User clicks "Apply" button
4. System validates:
   - Code exists and is active
   - Code is within valid date range
   - Code hasn't exceeded max uses
   - User's email is allowed (if email restriction exists)
   - Ticket type is valid for the code
5. If valid, discount is displayed
6. User proceeds to checkout with discounted/free price

For free tickets (100% discount), user goes directly to success page without payment.

## Validation Rules

The system checks coupon codes in this order:

1. ✅ **Code exists**: Case-insensitive lookup
2. ✅ **Is active**: `active = true`
3. ✅ **Date valid**: Current date between `validFrom` and `validUntil`
4. ✅ **Usage limit**: `currentUses < maxUses` (if maxUses is set)
5. ✅ **Email allowed**: User's email in `allowedEmails` (if restricted)
6. ✅ **Ticket type valid**: Selected ticket in `validFor` array (if restricted)

If any check fails, the coupon is rejected with a specific error message.

## Monitoring Usage

### Check Code Usage

```sql
SELECT
  code,
  description,
  "currentUses",
  "maxUses",
  CASE
    WHEN "maxUses" IS NULL THEN 'Unlimited'
    ELSE CAST(("maxUses" - "currentUses") AS TEXT) || ' remaining'
  END as remaining
FROM "DiscountCode"
WHERE active = true
ORDER BY "currentUses" DESC;
```

### View Registrations by Coupon

```sql
SELECT
  dc.code,
  dc.description,
  COUNT(r.id) as total_uses,
  SUM(r."discountAmount") / 100 as total_discount_aud
FROM "DiscountCode" dc
LEFT JOIN "Registration" r ON r."couponId" = dc.id
WHERE r.status = 'paid'
GROUP BY dc.id, dc.code, dc.description
ORDER BY total_uses DESC;
```

### Find Who Used a Code

```sql
SELECT
  r.name,
  r.email,
  r."ticketType",
  r."originalAmount" / 100 as original_price,
  r."discountAmount" / 100 as discount,
  r."amountPaid" / 100 as paid,
  r."createdAt"
FROM "Registration" r
JOIN "DiscountCode" dc ON r."couponId" = dc.id
WHERE dc.code = 'SPEAKER2026'
  AND r.status = 'paid'
ORDER BY r."createdAt" DESC;
```

## Best Practices

### Security
- ✅ Codes are case-insensitive (automatically converted to uppercase)
- ✅ Email matching is case-insensitive
- ✅ Validation happens server-side (can't be bypassed)
- ✅ Usage counter is incremented only after successful payment

### Code Naming
- Use descriptive, memorable codes: `SPEAKER2026`, `EARLYBIRD`, `VIP100`
- Include year for multi-year events: `PARTNER2026` vs `PARTNER2027`
- Avoid ambiguous characters: avoid O/0, I/l/1

### Email Management
- For speaker codes, add emails as speakers are accepted
- For VIP codes, keep list small and manually managed
- Consider using domains instead of individual emails if entire organizations get access

### Monitoring
- Check usage regularly to spot fraud
- Deactivate codes that are being shared inappropriately
- Set reasonable `maxUses` limits even for "unlimited" codes

## Troubleshooting

### "Invalid coupon code"
- Code doesn't exist or is misspelled
- Code has been deactivated (`active = false`)

### "This coupon has expired"
- Current date is before `validFrom` or after `validUntil`

### "This coupon has reached its usage limit"
- `currentUses >= maxUses`
- Increase `maxUses` or create a new code

### "This coupon is not valid for your email address"
- User's email not in `allowedEmails` array
- Add their email or use a different code

### "This coupon is not valid for the selected ticket type"
- Selected ticket type not in `validFor` array
- User needs to select a different ticket type or use different code

## Managing Free Ticket Emails

### Quick Reference

```typescript
import {
  addFreeTicketEmail,
  addBulkFreeTicketEmails,
  listFreeTicketEmails,
  checkFreeTicketEmail,
  deactivateFreeTicketEmail,
  reactivateFreeTicketEmail,
  removeFreeTicketEmail,
} from '@/lib/free-ticket-actions';

// Add single email
await addFreeTicketEmail('person@example.com', 'Accepted speaker');

// Add multiple emails
await addBulkFreeTicketEmails(
  ['person1@example.com', 'person2@example.com'],
  'Organizing committee'
);

// Check if email gets free ticket
const result = await checkFreeTicketEmail('person@example.com');
// Returns: { isFree: true, reason: 'Accepted speaker' }

// List all free emails
const emails = await listFreeTicketEmails();

// Deactivate (temporarily disable)
await deactivateFreeTicketEmail('person@example.com');

// Reactivate
await reactivateFreeTicketEmail('person@example.com');

// Permanently remove
await removeFreeTicketEmail('person@example.com');
```

### Via Prisma Studio

1. Run: `npx prisma studio`
2. Navigate to `FreeTicketEmail` model
3. Add/edit/delete records directly

### Via SQL

```sql
-- Add free ticket email
INSERT INTO "FreeTicketEmail" (id, email, reason, active, "notified", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'speaker@example.com', 'Accepted speaker', true, false, NOW(), NOW());

-- List all active free emails
SELECT email, reason, "createdAt"
FROM "FreeTicketEmail"
WHERE active = true
ORDER BY "createdAt" DESC;

-- Deactivate an email
UPDATE "FreeTicketEmail"
SET active = false, "updatedAt" = NOW()
WHERE email = 'speaker@example.com';

-- Remove an email permanently
DELETE FROM "FreeTicketEmail"
WHERE email = 'speaker@example.com';
```

## Future Enhancements

Consider adding:
- Admin dashboard for managing codes and free emails via UI
- Automatic email notifications when codes are used or free tickets detected
- Analytics dashboard showing discount usage trends
- Bulk code generation for unique codes per person
- Integration with speaker acceptance workflow
- Automatic code expiry warnings
- Email notification system when free ticket email is added
