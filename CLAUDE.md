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
* Pages use Next.js App Router: `/src/app/[route]/page.tsx`
* Components in `/src/components/`
* Global styles in `/src/app/globals.css` with CSS custom properties
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
* Tailwind utility-first with custom CSS variables defined in `:root`
* Use canonical Tailwind syntax: `bg-[--navy]` for CSS variables
* Gradients: Use linear-gradient() for navy-to-blue and cyan accents

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
