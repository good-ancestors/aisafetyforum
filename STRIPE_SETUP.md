# Stripe Registration Setup Guide

This guide will help you set up self-hosted registration with Stripe payments.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Neon PostgreSQL database (already configured)

## Step 1: Create Stripe Products

1. Log in to your Stripe Dashboard (https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create three products:

### Standard Ticket
- Name: "Australian AI Safety Forum 2026 - Standard"
- Description: "Industry/Professional ticket"
- Price: $595 AUD (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

### Academic Ticket
- Name: "Australian AI Safety Forum 2026 - Academic"
- Description: "Academic / Non-Profit / Government ticket"
- Price: $245 AUD (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

### Concession Ticket
- Name: "Australian AI Safety Forum 2026 - Concession"
- Description: "Student / Concession ticket"
- Price: $75 AUD (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

## Step 2: Get API Keys

1. Navigate to **Developers** → **API keys**
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. Copy your **Publishable key** (starts with `pk_test_...` for test mode)

## Step 3: Set Up Webhook

1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

## Step 4: Configure Environment Variables

Update your `.env` file with the values you collected:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..." # From Step 2
STRIPE_PUBLISHABLE_KEY="pk_test_..." # From Step 2
STRIPE_WEBHOOK_SECRET="whsec_..." # From Step 3

# Stripe Product Price IDs
STRIPE_PRICE_STANDARD="price_..." # From Step 1
STRIPE_PRICE_ACADEMIC="price_..." # From Step 1
STRIPE_PRICE_CONCESSION="price_..." # From Step 1

# Application URLs
NEXT_PUBLIC_BASE_URL="https://your-domain.com" # Your production URL
```

## Step 5: Test the Integration

### Local Testing

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhook events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Use the webhook signing secret provided by the CLI in your `.env` file
4. Test a payment using Stripe test card: `4242 4242 4242 4242`

### Test Card Numbers

- **Success**: 4242 4242 4242 4242 (any CVC, any future date)
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0027 6000 3184

## Step 6: Production Deployment

1. Switch from test mode to live mode in Stripe Dashboard
2. Get your **live** API keys (start with `sk_live_...` and `pk_live_...`)
3. Update webhook endpoint to your production URL
4. Update `.env` with live keys
5. Test with real payment amounts

## Database Schema

Registration data uses two tables: `Order` (payment info) and `Registration` (individual tickets):

```prisma
model Order {
  id              String         @id @default(cuid())
  purchaserEmail  String
  purchaserName   String
  paymentMethod   String         @default("card")  // "card" or "invoice"
  paymentStatus   String         @default("pending")
  stripeSessionId String?        @unique
  stripePaymentId String?
  totalAmount     Int            // Amount in cents
  discountAmount  Int            @default(0)
  orgName         String?        // For invoice orders
  orgABN          String?
  poNumber        String?
  invoiceNumber   String?        @unique
  invoiceDueDate  DateTime?
  couponId        String?
  registrations   Registration[]
}

model Registration {
  id              String   @id @default(cuid())
  email           String
  name            String
  organisation    String?
  ticketType      String   // "standard", "academic", "concession"
  ticketPrice     Int?
  stripeSessionId String?  @unique
  stripePaymentId String?
  amountPaid      Int
  originalAmount  Int
  discountAmount  Int      @default(0)
  status          String   @default("pending")  // "pending", "paid", "cancelled"
  orderId         String?
  couponId        String?
  profileId       String?
}
```

## Viewing Registrations

Use the admin dashboard at `/admin/orders` and `/admin/registrations`, or query directly:

```sql
-- All paid orders with total revenue
SELECT
  id, "purchaserEmail", "purchaserName", "totalAmount" / 100 as total_aud,
  "paymentStatus", "paymentMethod", "createdAt"
FROM "Order"
WHERE "paymentStatus" = 'paid'
ORDER BY "createdAt" DESC;

-- All paid registrations
SELECT
  r.name, r.email, r."ticketType", r."amountPaid" / 100 as paid_aud
FROM "Registration" r
WHERE r.status = 'paid'
ORDER BY r."createdAt" DESC;
```

## Troubleshooting

### Webhook not receiving events
- Check that your webhook URL is publicly accessible
- Verify the webhook signing secret matches
- Check webhook event logs in Stripe Dashboard

### Payment not completing
- Verify price IDs are correct in environment variables
- Check Stripe logs for errors
- Ensure database connection is working

### Test mode vs Live mode
- Always test in test mode first
- Test and live modes have different API keys and price IDs
- Webhook endpoints are separate for test and live modes

## Security Notes

- Never commit `.env` file to version control
- Use environment variables for all secrets
- Enable HTTPS in production
- Verify webhook signatures (already implemented)
- Keep Stripe API keys secure

## What's Already Implemented

- Email confirmations via Brevo (see [EMAIL_RECEIPT_SETUP.md](./EMAIL_RECEIPT_SETUP.md))
- Admin dashboard at `/admin` for managing orders and registrations
- Discount codes and free tickets (see [COUPON_SYSTEM.md](./COUPON_SYSTEM.md))
- Invoice payment option for organizations
- PDF receipt and invoice generation
- Refund handling via admin dashboard

## Related Documentation

- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Webhook configuration
- [COUPON_SYSTEM.md](./COUPON_SYSTEM.md) - Discount code management
- [EMAIL_RECEIPT_SETUP.md](./EMAIL_RECEIPT_SETUP.md) - Email configuration
- [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) - Production setup
