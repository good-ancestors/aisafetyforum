# Vercel Environment Variables Checklist

These environment variables must be set in Vercel for the deployment to succeed:

## Required for All Environments

### Database
- `DATABASE_URL` - PostgreSQL connection string (from Vercel Postgres)
  - **Important**: Should use `sslmode=verify-full` or `sslmode=require`
  - Example: `postgresql://user:pass@host/db?sslmode=verify-full`
- `POSTGRES_PRISMA_URL` - Prisma-specific connection string (from Vercel Postgres)
  - Should also include `sslmode=verify-full`

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_test_` for test mode)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_test_` for test mode)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (starts with `whsec_`)
- `STRIPE_PRICE_STANDARD` - Stripe price ID for standard tickets
- `STRIPE_PRICE_ACADEMIC` - Stripe price ID for academic tickets
- `STRIPE_PRICE_CONCESSION` - Stripe price ID for concession tickets

### Email
- `BREVO_API_KEY` - Brevo (SendInBlue) API key for transactional emails

### Application
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
  - **IMPORTANT**: Must include `https://` protocol
  - Production: `https://aisafetyforum.au`
  - Vercel: `https://aisafetyforum.vercel.app`
  - Preview: Use `https://$VERCEL_URL` (Vercel auto-populates this)
  - Used for Stripe redirect URLs (success/cancel pages)
  - Code has fallback, but explicit setting is recommended

## Environment-Specific Notes

### Production
- Use production Stripe keys and webhook secrets
- Set `NEXT_PUBLIC_BASE_URL` to production domain
- Ensure DATABASE_URL points to production database

### Staging
- Can use test Stripe keys
- Set `NEXT_PUBLIC_BASE_URL` to staging domain
- Use separate staging database if available

### Preview Deployments
- Will inherit environment variables from production/preview settings
- May need separate webhook endpoints configured in Stripe

## Verification Commands

To check if all required variables are set in Vercel:
```bash
vercel env ls
```

To pull environment variables locally:
```bash
vercel env pull
```

## Current Status

Local .env has all required variables set ✓
Build passes locally ✓
Need to verify Vercel deployment has all variables set
