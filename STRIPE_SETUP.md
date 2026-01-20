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

The registration data is stored in the `Registration` table:

```prisma
model Registration {
  id              String   @id @default(cuid())
  email           String
  name            String
  organisation    String?
  ticketType      String
  stripeSessionId String?  @unique
  stripePaymentId String?
  amountPaid      Int
  status          String   @default("pending")
  attendeeDetails Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Viewing Registrations

You can query registrations directly in your database or build an admin panel.

Example query to see all paid registrations:

```sql
SELECT * FROM "Registration" WHERE status = 'paid' ORDER BY "createdAt" DESC;
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

## Next Steps

Consider adding:
- Email confirmations (using Resend or similar)
- Admin dashboard for viewing registrations
- Export registrations to CSV
- Refund handling UI
- Ticket check-in system
