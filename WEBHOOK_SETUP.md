# Stripe Webhook Setup Guide

This guide walks you through setting up Stripe webhooks for local development, staging, and production environments.

## Architecture Overview

```
Local Development → Stripe CLI forwards webhooks to localhost
Staging           → Vercel staging branch with dedicated webhook
Production        → Vercel production with dedicated webhook (when ready)
```

All environments currently use Stripe **test mode**. When moving to production, you'll add live mode configuration.

---

## 1. Vercel Staging Setup

### Create Staging Branch

1. Push your `staging` branch to GitHub:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. In Vercel Dashboard:
   - Go to Project Settings → Git
   - The `staging` branch will auto-deploy to a stable URL like:
     `https://aisafetyforum-staging.vercel.app`

### Configure Vercel Environment Variables for Staging

1. Go to Vercel Dashboard → Project → Settings → Environment Variables

2. Add these variables with **Preview (staging branch only)** scope:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_staging_secret  # Get from Stripe (step 2)

   DATABASE_URL=postgresql://...  # Your staging database
   POSTGRES_PRISMA_URL=postgresql://...

   STRIPE_PRICE_STANDARD=price_...
   STRIPE_PRICE_ACADEMIC=price_...
   STRIPE_PRICE_CONCESSION=price_...

   NEXT_PUBLIC_BASE_URL=https://aisafetyforum-staging.vercel.app
   ```

---

## 2. Stripe Dashboard - Create Staging Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) (Test Mode)

2. Navigate to **Developers → Webhooks**

3. Click **Add endpoint**

4. Configure:
   - **Endpoint URL**: `https://aisafetyforum-staging.vercel.app/api/webhooks/stripe`
   - **Description**: `Staging - AI Safety Forum`
   - **Events to send**: Select these events:
     - `checkout.session.completed` (required - triggers order completion)
     - `checkout.session.expired` (optional - marks abandoned checkouts)
     - `payment_intent.payment_failed` (optional - marks failed payments)

5. Click **Add endpoint**

6. **Copy the Signing Secret** (starts with `whsec_...`)
   - Add this to Vercel as `STRIPE_WEBHOOK_SECRET` for staging environment

7. Redeploy staging in Vercel to pick up the new environment variable

---

## 3. Local Development Setup

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# Download from: https://github.com/stripe/stripe-cli/releases
```

### Authenticate

```bash
stripe login
```

### Forward Webhooks to Local

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the Stripe CLI webhook forwarder:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Copy the webhook signing secret** from the output (starts with `whsec_...`)

4. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...your_local_secret
   ```

5. Restart your dev server to pick up the new variable

### Test Local Webhooks

In another terminal, trigger test events:

```bash
# Test successful payment
stripe trigger checkout.session.completed

# Test expired session
stripe trigger checkout.session.expired

# Test failed payment
stripe trigger payment_intent.payment_failed
```

Check your Next.js console for webhook processing logs.

---

## 4. Testing Webhooks

### Staging Test

1. Go to your staging URL: `https://aisafetyforum-staging.vercel.app`
2. Complete a test registration with Stripe test card: `4242 4242 4242 4242`
3. Check Vercel logs to see webhook processed:
   ```
   ✅ Checkout session completed: cs_test_...
   ✅ Registration abc123 marked as paid
   ```

### Local Test

1. Complete registration on `localhost:3000`
2. Use test card: `4242 4242 4242 4242`
3. Watch webhook logs in both terminals:
   - Stripe CLI will show webhook forwarded
   - Next.js console will show processing logs

---

## 5. Troubleshooting

### Webhook signature verification fails

**Cause**: Wrong `STRIPE_WEBHOOK_SECRET` for the environment

**Fix**:
- Local: Copy secret from `stripe listen` output
- Staging: Copy secret from Stripe Dashboard webhook settings
- Make sure to restart your server after updating `.env.local`

### No webhook received (staging)

**Possible causes**:
1. Vercel deployment protection blocking the webhook
   - Go to Vercel Settings → Deployment Protection
   - Ensure webhooks can reach your endpoint
2. Wrong webhook URL in Stripe Dashboard
3. Webhook not enabled for the events you're testing

**Fix**: Check Stripe Dashboard → Webhooks → Click your endpoint → View logs

### Registration stays in "pending" status

**Cause**: Webhook not firing or failing

**Fix**:
1. Check Stripe Dashboard webhook logs
2. Check Vercel/local server logs
3. Verify `stripeSessionId` is being saved correctly

---

## 6. Moving to Production (Future)

When ready to accept real payments:

1. **Create production webhook** in Stripe Dashboard (Live Mode):
   - URL: `https://aisafetyforum.com/api/webhooks/stripe`
   - Copy the signing secret

2. **Add production environment variables** in Vercel (Production scope):
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   STRIPE_PRICE_STANDARD=price_live_...
   STRIPE_PRICE_ACADEMIC=price_live_...
   STRIPE_PRICE_CONCESSION=price_live_...
   ```

3. **Keep test mode for staging** - staging continues using test keys

---

## Webhook Endpoint Details

**File**: `app/api/webhooks/stripe/route.ts`

**Handled Events**:
- `checkout.session.completed` - Completes order (marks paid + sends emails via `completeOrder()`)
- `checkout.session.expired` - Marks order as cancelled
- `payment_intent.payment_failed` - Marks order as failed

**Order Completion Flow**:
The webhook calls `completeOrder()` from `lib/order-completion.ts` which:
1. Marks the order and all registrations as paid
2. Sends receipt email to purchaser
3. Sends ticket confirmation to each attendee

**Security**:
- Verifies webhook signatures using `STRIPE_WEBHOOK_SECRET`
- Rejects requests without valid signatures
- Logs all webhook events for debugging

---

## Quick Reference

```bash
# Local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed

# Test card numbers
4242 4242 4242 4242 - Success
4000 0000 0000 0002 - Declined
4000 0025 0000 3155 - Requires authentication
```

**Stripe Dashboard**: https://dashboard.stripe.com
**Webhook endpoint**: `/api/webhooks/stripe`
**Test mode**: All environments currently use test mode
