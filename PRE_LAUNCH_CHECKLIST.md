# AI Safety Forum - Pre-Launch Checklist

## Critical Configuration (Must Complete Before Launch)

### 1. Bank Details
Update bank details in `lib/config.ts:52-58`:
- [ ] Replace `bsb: 'TBD'` with actual BSB
- [ ] Replace `accountNumber: 'TBD'` with actual account number
- [ ] Replace `bank: 'TBD'` with actual bank name

### 2. Environment Variables (Vercel Dashboard)
Verify all production environment variables are set:

**Database**
- [ ] `DATABASE_URL` - Production Neon database connection string

**Authentication**
- [ ] `NEON_AUTH_BASE_URL` - Production Neon Auth URL
- [ ] `NEON_JWKS_URL` - Production JWKS URL for JWT validation

**Stripe (Production Keys)**
- [ ] `STRIPE_SECRET_KEY` - Production secret key (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Production webhook signing secret (whsec_...)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Production publishable key (pk_live_...)
- [ ] `STRIPE_PRICE_STANDARD` - Production price ID for standard tickets
- [ ] `STRIPE_PRICE_ACADEMIC` - Production price ID for academic tickets
- [ ] `STRIPE_PRICE_CONCESSION` - Production price ID for concession tickets
- [ ] `STRIPE_PRICE_STANDARD_EARLY` - Production price ID for early bird standard
- [ ] `STRIPE_PRICE_ACADEMIC_EARLY` - Production price ID for early bird academic
- [ ] `STRIPE_PRICE_CONCESSION_EARLY` - Production price ID for early bird concession

**Email**
- [ ] `BREVO_API_KEY` - Production Brevo API key

**Site**
- [ ] `NEXT_PUBLIC_SITE_URL` - Set to `https://aisafetyforum.au`
- [ ] `NEXT_PUBLIC_BASE_URL` - Set to `https://aisafetyforum.au`

### 3. Stripe Configuration
- [ ] Create production products and prices in Stripe Dashboard
- [ ] Configure webhook endpoint: `https://aisafetyforum.au/api/webhooks/stripe`
- [ ] Enable `checkout.session.completed` webhook event
- [ ] Enable `checkout.session.expired` webhook event (optional)
- [ ] Test a transaction with a real card in production mode

### 4. Database Setup
- [ ] Run `npx prisma migrate deploy` on production database
- [ ] Set initial admin user(s) using `npx tsx scripts/set-admin.ts <email>`
- [ ] Verify database connection from Vercel

### 5. Domain & DNS
- [ ] Domain `aisafetyforum.au` pointed to Vercel
- [ ] SSL certificate verified
- [ ] www redirect configured (if desired)

---

## Pre-Launch Testing

### Authentication Flow
- [ ] Sign up with email OTP works
- [ ] Sign in with email OTP works
- [ ] Sign out works
- [ ] Protected routes redirect to sign-in

### Registration Flow
- [ ] Single ticket registration works
- [ ] Multi-ticket registration works
- [ ] Coupon codes apply correctly
- [ ] Free tickets for eligible emails work
- [ ] Invoice registration flow works
- [ ] Stripe checkout completes successfully
- [ ] Confirmation emails are received
- [ ] Receipt/invoice PDFs generate correctly

### Dashboard
- [ ] User can view their tickets
- [ ] User can view their applications
- [ ] User can update their profile
- [ ] User can cancel tickets (with refund if applicable)

### Admin Dashboard
- [ ] Admin can view all registrations
- [ ] Admin can view all orders
- [ ] Admin can manage discount codes
- [ ] Admin can manage free ticket emails
- [ ] Admin can cancel orders/issue refunds
- [ ] Admin can manage applications

### Contact Form
- [ ] Contact form submissions send email to team
- [ ] Reply-to is set correctly to user's email

---

## Security Checklist

### Already Implemented ✓
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- [x] Content Security Policy (CSP)
- [x] Strict-Transport-Security (HSTS)
- [x] Stripe webhook signature verification
- [x] Rate limiting on API routes
- [x] Authentication middleware on protected routes
- [x] Admin authorization on admin actions
- [x] HTML escaping in PDF generation
- [x] Parameterized database queries (Prisma)
- [x] PII redaction in production logs

### Manual Verification
- [ ] Verify CORS is not overly permissive
- [ ] Test rate limiting is working
- [ ] Verify no sensitive data in client-side code
- [ ] Check browser console for errors/warnings

---

## Known Limitations

### Rate Limiting
The current rate limiter is in-memory and per-instance. This means:
- Rate limits are NOT shared across Vercel serverless instances
- Effective rate limit = configured limit × number of instances

For MVP, this provides basic protection. For stricter limiting, consider upgrading to Vercel KV or Upstash Redis.

### NPM Vulnerabilities
10 remaining vulnerabilities (3 low, 7 moderate) are in dev/build dependencies:
- `lodash` in Prisma CLI tooling (not runtime)
- `cookie` in next-auth dev dependencies (not runtime)

These do not affect the production runtime and can be addressed in a future update.

---

## Post-Launch Monitoring

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Vercel deployment logs
- [ ] Monitor Stripe webhook delivery
- [ ] Set up uptime monitoring
- [ ] Monitor email delivery rates in Brevo

---

## Rollback Plan

If issues are discovered post-launch:
1. Revert to previous Vercel deployment via dashboard
2. If database changes needed, restore from Neon backup
3. Communicate with affected users via email

---

## Launch Day Checklist

- [ ] Final review of all environment variables
- [ ] Test one complete registration flow
- [ ] Verify emails are being sent
- [ ] Check admin dashboard access
- [ ] Monitor logs for first 30 minutes
- [ ] Have Stripe and Vercel dashboards open for monitoring
