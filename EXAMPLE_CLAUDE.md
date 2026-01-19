# Tech Stack

## Framework
* Next.js 16.0.10 with App Router
* React 19.2.1
* TypeScript 5

## Key Dependencies
* **Styling**: Tailwind CSS 4.1.17 with custom CSS variables
* **Animations**: Framer Motion 12.23.25
* **Markdown**: react-markdown 10.1.0 with remark-gfm
* **Payments**: Stripe integration (react-stripe-js, stripe)
* **Other**: email-validator, gray-matter, formspark (for forms), html2pdf.js (for client-side PDF exports)

## Forms with Formspark
When implementing forms using submit-form.com (Formspark), ALWAYS include these headers:
```typescript
headers: {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}
```
**Critical:** The `Accept: 'application/json'` header is required to prevent CORS errors. Without it, Formspark will attempt to redirect to a success page instead of returning JSON, which causes CORS issues.

See examples in:
* `/src/components/ContactForm.tsx`
* `/src/components/CareersForm.tsx`
* `/src/app/bingo-2026/page.tsx`

## Project Structure
* Pages use Next.js App Router: `/src/app/[route]/page.tsx`
* Components in `/src/components/`
* Global styles in `/src/app/globals.css` with CSS custom properties
* Static assets in `/public/`
* Brand assets in `/public/brand/` (logos, glyphs in SVG/PNG)
* Content markdown files in `/content/`

## Styling Approach
* Tailwind utility-first with custom CSS variables defined in `:root`
* Fonts: Poppins for headings, Inter for body text
* Color system: `--ui-01` through `--ui-05`, `--text-01`, `--text-02`, `--button-primary`
* Use canonical Tailwind syntax: `bg-(--ui-01)` instead of `bg-[var(--ui-01)]`

# Design
* Minimalist, modern and bold.
* Square, sharp corners
* No shadows
* Neutral grays and whites
* Poppins for headings, Inter for body
* Subtle hover and active states for interactivity
* Responsive layout for all screen sizes