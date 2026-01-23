# Vercel Environment Variables Checklist

These environment variables must be set in Vercel for the deployment to succeed:

## Required for All Environments

### Database
- `DATABASE_URL` - PostgreSQL connection string (from Neon via Vercel integration)
  - **Important**: Should use `sslmode=verify-full` or `sslmode=require`
  - Example: `postgresql://user:pass@host/db?sslmode=verify-full`
  - **Auto-provided** by Neon integration in Vercel
- `POSTGRES_PRISMA_URL` - Prisma-specific connection string (from Neon via Vercel integration)
  - Uses connection pooling for better serverless performance
  - Should also include `sslmode=verify-full`
  - **Auto-provided** by Neon integration in Vercel

> **Note:** See [NEON_DATABASE_SETUP.md](./NEON_DATABASE_SETUP.md) for detailed Neon configuration

### Authentication (Neon Auth)
- `NEON_AUTH_BASE_URL` - Neon Auth base URL for your project
  - Example: `https://auth.neon.tech/...`
  - Used for email OTP authentication
- `NEON_JWKS_URL` - JWKS URL for JWT validation
  - Example: `https://auth.neon.tech/.well-known/jwks.json`
  - Used to verify authentication tokens

### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_test_` for test mode, `sk_live_` for production)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_test_` or `pk_live_`)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (starts with `whsec_`)

**Regular Ticket Prices:**
- `STRIPE_PRICE_STANDARD` - Standard ticket ($595)
- `STRIPE_PRICE_ACADEMIC` - Academic ticket ($245)
- `STRIPE_PRICE_CONCESSION` - Concession ticket ($75)

**Early Bird Prices:**
- `STRIPE_PRICE_STANDARD_EARLYBIRD` - Early bird standard ($357)
- `STRIPE_PRICE_ACADEMIC_EARLYBIRD` - Early bird academic ($147)
- `STRIPE_PRICE_CONCESSION_EARLYBIRD` - Early bird concession ($45)

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
