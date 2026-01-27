# Tech Stack

## Framework
* Next.js 15+ with App Router
* React 19+
* TypeScript 5

## Key Dependencies
* **Styling**: Tailwind CSS 4+ with custom CSS variables
* **Animations**: Framer Motion for smooth transitions
* **Fonts**: Public Sans for body text, Libre Baskerville for headings

## Project Structure
* Pages use Next.js App Router: `/app/[route]/page.tsx`
* Components in `/components/`
* Utilities and server actions in `/lib/`
* Database schema in `/prisma/schema.prisma`
* Global styles in `/app/globals.css` with CSS custom properties
* Static assets in `/public/`

## Design System

### Colors
Navy palette:
* `--navy`: #0a1f5c (primary navy)
* `--navy-light`: #1a3a8f
* `--navy-dark`: #061440
* `--blue`: #0047ba
* `--cyan`: #00d4ff (accent)
* `--cyan-dark`: #00b8e0
* `--teal`: #0099cc
* `--grey`: #a8b0b8

Backgrounds:
* `--bg-cream`: #f9fafb (page background)
* `--bg-white`: #ffffff (card background)
* `--bg-light`: #f0f4f8

Text:
* `--text-dark`: #1a1a1a
* `--text-body`: #333333
* `--text-muted`: #5c6670

Borders:
* `--border`: #e0e4e8

### Typography
* **Headings**: Libre Baskerville (serif) - elegant, authoritative
* **Body**: Public Sans (sans-serif) - clean, modern, professional
* Font loading: Use next/font/google for optimal loading

### Styling Approach
* Tailwind 4 with `@theme` directive in `globals.css` for design system colors
* Use Tailwind utility classes directly: `bg-navy`, `text-cyan`, `border-border`
* CSS variables in `:root` are for arbitrary value fallbacks only: `bg-[--bg-light]`
* **IMPORTANT**: Tailwind 4 generates utilities from `@theme { --color-navy: #xxx }` → `bg-navy`
* Gradients: Use `bg-gradient-to-r from-navy to-brand-blue` or linear-gradient() in custom CSS

## Design Principles

* **Professional & Authoritative**: Reflects the seriousness of AI safety
* **Clean & Modern**: Geometric shapes, crisp lines, no shadows
* **Accessible**: High contrast, clear typography, semantic HTML
* **Responsive**: Mobile-first approach, fluid layouts
* **Subtle Interactions**: Hover states, smooth transitions, no aggressive animations

## Brand Identity

### Logo
* Circular icon with gradient (navy to blue)
* Stylized lines representing AI/data with cyan accents
* Text: "AI" | "SAFETY" / "FORUM" with specific typography hierarchy

### Visual Elements
* Geometric background shapes (circles, squares)
* Grid overlays with subtle cyan tint
* Floating animations for depth
* Left border accents on cards (navy/cyan)

## Authentication

* **Provider**: Neon Auth (`@neondatabase/auth`) — a managed wrapper around Better Auth
* **Method**: Email OTP (passwordless, no passwords stored)
* **Schema**: Auth data lives in `neon_auth` schema (separate from `public`); profile data in `public.Profile`
* **Client**: `lib/auth/client.ts` — `createAuthClient()` for client-side auth operations
* **Server**: `lib/auth/server.ts` — `getSession()`, `getCurrentUser()` for server-side session access
* **Profile linking**: `lib/auth/profile.ts` — links `neon_auth.user` to `public.Profile` by `neonAuthUserId` or email

### neon_auth schema access
Neon Auth manages the `neon_auth` schema (tables: `user`, `session`, `account`, `verification`).
Since these aren't in Prisma's `public` schema, use `prisma.$executeRaw` / `prisma.$queryRaw` for
direct access. See `lib/admin-actions.ts` and `lib/profile-actions.ts` for examples.

### Account deletion
Account deletion uses raw SQL against `neon_auth` tables within the same Prisma transaction as
profile cleanup. This is intentional — Neon Auth doesn't expose Better Auth's `deleteUser` config
(which requires `sendDeleteAccountVerification` for passwordless users), and `admin.removeUser()`
requires Better Auth admin role. See the `deleteProfile()` JSDoc in `lib/profile-actions.ts`.

## Content Structure

### Home Page Sections
1. Top bar with event year and link to previous event
2. Header with logo and navigation
3. Hero with gradient background, title, CTA, and event card
4. Topics grid (6 key themes)
5. About section with features
6. CTA section
7. Footer with organization info

### Key Topics (always use these 6):
1. Technical AI Safety
2. AI Governance
3. Australia's Role
4. Risk Assessment
5. Evaluations & Testing
6. Cross-Sector Dialogue
