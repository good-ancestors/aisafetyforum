# Testing the Registration System

## Test Data Available

I've prepared test coupon codes and free ticket emails for you to test with. You can set these up by running the setup script (see below), or just use the codes/emails listed here.

### Test Coupon Codes

You can enter these codes in the "Have a coupon code?" field during registration:

| Code | Type | Discount | Description |
|------|------|----------|-------------|
| `TEST50` | Percentage | 50% off | Half price on any ticket |
| `TESTFREE` | Free | 100% off | Completely free ticket |
| `TEST20` | Fixed | $20 off | Twenty dollars off any ticket |

### Test Free Ticket Emails

These emails automatically get free tickets without needing a code. Just enter one of these emails and tab out of the email field:

| Email | Reason |
|-------|--------|
| test@example.com | Test user for development |
| speaker@example.com | Test speaker |
| vip@example.com | Test VIP |

## Setting Up Test Data

If the test data doesn't exist yet in your database, you'll need to add it. You have two options:

### Option 1: Run the Setup Script

**Note**: This requires your Prisma/Neon database to be configured.

```bash
npx tsx scripts/setup-test-data.ts
```

### Option 2: Add Manually via Prisma Studio

```bash
npx prisma studio
```

Then add the records manually using the tables above as a guide.

### Option 3: Use SQL Directly

Connect to your Neon database and run:

```sql
-- Add test coupon codes
INSERT INTO "DiscountCode" (id, code, description, type, value, "validFor", "allowedEmails", "maxUses", "currentUses", active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'TEST50', 'Test coupon - 50% off', 'percentage', 50, '{}', '{}', NULL, 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'TESTFREE', 'Test coupon - Free ticket', 'free', 100, '{}', '{}', NULL, 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'TEST20', 'Test coupon - $20 off', 'fixed', 2000, '{}', '{}', NULL, 0, true, NOW(), NOW());

-- Add test free ticket emails
INSERT INTO "FreeTicketEmail" (id, email, reason, active, notified, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'test@example.com', 'Test user for development', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'speaker@example.com', 'Test speaker', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'vip@example.com', 'Test VIP', true, false, NOW(), NOW());
```

## Testing Scenarios

### 1. Testing Coupon Code (Percentage Discount)

1. Go to http://localhost:3000/register
2. Fill in:
   - Email: `yourname@test.com` (any email)
   - Name: Your Name
   - Organization: (optional)
   - Select any ticket type
3. In "Have a coupon code?" field, enter: `TEST50`
4. Click "Apply"
5. ✅ Should see: "Coupon applied! Test coupon - 50% off"
6. ✅ Should see the price reduced by 50%

### 2. Testing Coupon Code (Free Ticket)

1. Go to http://localhost:3000/register
2. Fill in form with any email
3. Enter coupon: `TESTFREE`
4. Click "Apply"
5. ✅ Should see: "Complimentary ticket — No payment required"
6. Click "Proceed to Payment"
7. ✅ Should bypass Stripe and go directly to success page

### 3. Testing Email-Based Free Ticket (No Code Needed)

1. Go to http://localhost:3000/register
2. In the email field, enter: `test@example.com`
3. Tab out of the email field (or click elsewhere)
4. ✅ Should see green notification: "Complimentary registration! Test user for development"
5. ✅ Coupon code field should be hidden
6. Complete rest of form
7. Click "Proceed to Payment"
8. ✅ Should go directly to success page without Stripe checkout

### 4. Testing Fixed Amount Discount

1. Go to http://localhost:3000/register
2. Fill in form, select "Standard" ticket ($595)
3. Enter coupon: `TEST20`
4. Click "Apply"
5. ✅ Should see: "$20 discount: $595.00 → $575.00"

### 5. Testing Invalid Coupon

1. Go to http://localhost:3000/register
2. Enter coupon: `INVALID123`
3. Click "Apply"
4. ✅ Should see error: "Invalid coupon code"

## Checking Test Results

### View Registrations

```bash
npx prisma studio
```

Navigate to the `Registration` table to see all test registrations.

### SQL Queries

```sql
-- See all registrations
SELECT
  name,
  email,
  "ticketType",
  "originalAmount" / 100 as original_price,
  "discountAmount" / 100 as discount,
  "amountPaid" / 100 as paid,
  status
FROM "Registration"
ORDER BY "createdAt" DESC;

-- See coupon usage
SELECT
  code,
  description,
  "currentUses",
  "maxUses"
FROM "DiscountCode"
WHERE active = true;

-- See who used free email tickets
SELECT
  r.name,
  r.email,
  r."ticketType",
  r."createdAt"
FROM "Registration" r
WHERE r.email IN (SELECT email FROM "FreeTicketEmail" WHERE active = true)
ORDER BY r."createdAt" DESC;
```

## Notes for Production

Before going live, remember to:

- [ ] Remove or deactivate all TEST* coupon codes
- [ ] Remove test@example.com and other test emails from FreeTicketEmail
- [ ] Create real production coupon codes
- [ ] Add real speaker/VIP emails to FreeTicketEmail
- [ ] Configure Stripe webhooks properly
- [ ] Test the full payment flow with real Stripe checkout
