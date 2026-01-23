# AI Safety Forum Australia

Website and registration system for the Australian AI Safety Forum 2026.

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **UI**: React 19+, TypeScript, Tailwind CSS 4+
- **Animations**: Framer Motion
- **Database**: Neon PostgreSQL with Prisma ORM
- **Auth**: Neon Auth (email OTP)
- **Payments**: Stripe Checkout
- **Email**: Brevo (transactional emails)

## Project Structure

```
/app                  # Next.js App Router pages
  /admin              # Admin dashboard (protected)
  /api                # API routes (webhooks, auth)
  /dashboard          # User dashboard (protected)
  /register           # Registration flow
/components           # React components
/lib                  # Utilities, actions, config
/prisma               # Database schema
/public               # Static assets
/scripts              # Admin scripts
```

## Key Features

- Multi-ticket registration with group orders
- Invoice payment option for organizations
- Discount codes and free ticket management
- Admin dashboard for order/registration management
- Email confirmations with calendar invites
- PDF receipt and invoice generation

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](./CLAUDE.md) | Design system and coding guidelines |
| [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) | Launch preparation checklist |
| [STRIPE_SETUP.md](./STRIPE_SETUP.md) | Stripe integration guide |
| [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) | Webhook configuration |
| [COUPON_SYSTEM.md](./COUPON_SYSTEM.md) | Discount code management |
| [EMAIL_RECEIPT_SETUP.md](./EMAIL_RECEIPT_SETUP.md) | Email configuration |
| [NEON_DATABASE_SETUP.md](./NEON_DATABASE_SETUP.md) | Database setup |
| [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) | Environment variables |
| [TESTING.md](./TESTING.md) | Test data and scenarios |

## Environment Variables

See [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) for full list. Key variables:

```bash
DATABASE_URL=           # Neon PostgreSQL connection
NEON_AUTH_BASE_URL=     # Neon Auth URL
STRIPE_SECRET_KEY=      # Stripe API key
BREVO_API_KEY=          # Email API key
NEXT_PUBLIC_BASE_URL=   # Site URL
```

## Scripts

```bash
npm run dev             # Start development server
npm run build           # Production build
npm run lint            # Run ESLint
npx prisma studio       # Database GUI
npx prisma migrate dev  # Run migrations
npx tsx scripts/set-admin.ts <email>  # Set admin user
```
