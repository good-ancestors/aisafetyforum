# Tech Stack

## Development Practices

### Before Creating New Files
* **Check if similar file exists**: `ls *.ts` or `glob` for patterns like `proxy.ts`, `middleware.ts`
* **Check framework conventions**: Next.js 16 uses `proxy.ts` not `middleware.ts`
* **Search codebase first**: Use Grep/Glob before assuming something doesn't exist

### Before Performance Optimization
* **Measure first**: Add `console.log(\`[PERF] ${name}: ${time}ms\`)` timing
* **Trace full request flow**: Identify ALL operations, not just obvious ones
* **Identify root cause**: Don't treat symptoms (e.g., "add caching") without understanding cause
* **Use official APIs**: Never bypass library internals (e.g., reading cookies directly) to "optimize"
* **Read library source if needed**: Check what official functions actually do before replacing them

### When Unsure About Framework Conventions
* **Check current docs**: Next.js, React, and library APIs change frequently
* **Verify versions**: This project uses Next.js 16+, React 19+ (not 15/18)
* **Search for deprecations**: Features like `middleware.ts` get renamed/deprecated

### Using Third-Party Libraries
* **Use official APIs only**: Never access internal implementation details
* **Cookie/token names are internal**: Libraries can change them between versions
* **Read library source when debugging**: But don't depend on internal behavior
* **If official API is slow**: Profile, document, and file an issue - don't bypass

## Framework
* Next.js 16+ with App Router
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
* **Request interception**: `proxy.ts` (NOT `middleware.ts` - deprecated in Next.js 16)

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

* **Provider**: Neon Auth (`@neondatabase/auth`) — managed wrapper around Better Auth
* **Method**: Email OTP (passwordless)
* **Schema**: Auth data in `neon_auth` schema; profile data in `public.Profile`
* **Key files**: `lib/auth/client.ts`, `lib/auth/server.ts`, `lib/auth/profile.ts`
* **neon_auth access**: Use `prisma.$executeRaw` / `$queryRaw` (not in Prisma schema). See `lib/admin-actions.ts`

### Auth Architecture (Next.js 16)
```
proxy.ts (neonAuthMiddleware)     ← Official middleware, validates session
    ↓
Layout (getOrCreateCurrentProfile) ← Profile lookup (uses neonAuth internally)
    ↓
Data queries                       ← Business data, can use unstable_cache
```

### Important Auth Rules
* **DO NOT** use `middleware.ts` - deprecated, use `proxy.ts` instead
* **DO NOT** manually check cookie names - they are internal implementation details
* **DO NOT** hardcode cookie names like `better-auth.session_token` or `__Secure-neon-auth.session_token`
* **DO** use official `neonAuthMiddleware` in proxy.ts
* **DO** use official `neonAuth()` for session validation in server components
* **DO** use `React.cache()` for request-level deduplication
* **DO** use `prefetch={false}` on dashboard navigation links to prevent request storms

### Auth Performance Considerations
* `neonAuthMiddleware` and `neonAuth()` make HTTP calls to Neon Auth service
* Multiple components calling `neonAuth()` independently can cause duplicate requests
* Use `React.cache()` wrapper to deduplicate within a single request
* If performance is an issue, profile first before optimizing
* Do NOT try to "optimize" by reading cookies directly - this breaks auth

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
