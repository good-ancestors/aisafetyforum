# Security and Code Quality Audit Report

**Project:** AI Safety Forum Website
**Date:** January 24, 2026
**Auditor:** Claude Code Security Audit

---

## Executive Summary

This audit reviewed the AI Safety Forum website codebase for security vulnerabilities, code quality issues, and best practices compliance. The application is a Next.js 16+ website with TypeScript, Prisma ORM, Stripe payments, and Neon Auth authentication.

### Overall Assessment: **GOOD** (with some improvements recommended)

The codebase demonstrates solid security practices overall. The main areas of concern are moderate-severity dependency vulnerabilities and some authorization gaps that should be addressed.

---

## Findings Summary

| Severity | Count | Category |
|----------|-------|----------|
| Critical | 0 | - |
| High | 1 | Authorization (IDOR) |
| Medium | 4 | Dependencies, Missing Auth Checks |
| Low | 5 | Rate Limiting, Hardening |
| Info | 3 | Best Practices |

---

## Detailed Findings

### HIGH SEVERITY

#### 1. IDOR Vulnerability in Profile Update (`lib/profile-actions.ts:130-173`)

**Issue:** The `updateProfile()` function accepts an email parameter directly without verifying the authenticated user owns that profile.

```typescript
export async function updateProfile(
  email: string,  // <-- User-supplied email, not validated against session
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> {
```

**Risk:** Any authenticated user could potentially update any other user's profile by providing their email address.

**Recommendation:** Validate that the email matches the current authenticated user:
```typescript
const user = await getCurrentUser();
if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
  return { success: false, error: 'Unauthorized' };
}
```

---

### MEDIUM SEVERITY

#### 2. Dependency Vulnerabilities (10 total vulnerabilities)

**Finding:** `npm audit` reports 10 vulnerabilities (3 low, 7 moderate):

- **cookie <0.7.0** - Out of bounds character handling in `next-auth` dependency
- **lodash 4.0.0 - 4.17.21** - Prototype pollution in `_.unset` and `_.omit` (via Prisma)

**Recommendation:**
```bash
# Try safe fixes first
npm audit fix

# If breaking changes are acceptable:
npm audit fix --force
```

Consider upgrading `next-auth` and monitoring Prisma for updates.

---

#### 3. Missing Admin Authorization on Invoice Functions (`lib/admin-actions.ts:11-31`)

**Issue:** `getInvoiceOrders()` does not call `requireAdmin()`:

```typescript
export async function getInvoiceOrders(status?: 'pending' | 'paid' | 'all') {
  // No admin check here!
  const where = { ... };
  const orders = await prisma.order.findMany({ ... });
  return orders;
}
```

**Risk:** If this function is exposed through a route, non-admin users could list all invoice orders.

**Recommendation:** Add `requireAdmin()` check at the start of the function.

---

#### 4. Missing Admin Authorization on Resend Invoice (`lib/admin-actions.ts:110-220`)

**Issue:** `resendInvoiceEmail()` does not verify admin privileges.

**Risk:** Any authenticated user could potentially trigger invoice emails.

**Recommendation:** Add `requireAdmin()` check.

---

#### 5. Missing Admin Authorization on Mark Paid (`lib/admin-actions.ts:36-105`)

**Issue:** `markInvoiceAsPaid()` does not call `requireAdmin()`.

**Risk:** Non-admin users could mark invoices as paid, bypassing payment.

**Recommendation:** Add `requireAdmin()` check immediately.

---

### LOW SEVERITY

#### 6. In-Memory Rate Limiting (`lib/rate-limit.ts`)

**Issue:** Rate limiting uses an in-memory Map, which doesn't share state across serverless instances.

**Impact:** On Vercel with multiple instances, effective rate limits are multiplied by instance count.

**Recommendation:** For production, upgrade to Vercel KV or Upstash Redis for shared rate limit state. The code already documents this limitation.

---

#### 7. CSP Allows 'unsafe-inline' and 'unsafe-eval' (`next.config.ts:52`)

**Issue:** Content Security Policy includes:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
```

**Impact:** XSS protection is weakened. However, this is often necessary for Next.js and Stripe.

**Recommendation:** If possible, migrate to nonce-based CSP for scripts. The current setup is acceptable given the Stripe integration requirements.

---

#### 8. No Middleware Authentication Layer

**Issue:** No `middleware.ts` exists for route-level authentication protection.

**Impact:** Authentication relies entirely on individual route/action checks.

**Recommendation:** Consider adding middleware to protect `/dashboard/*` and `/admin/*` routes at the edge.

---

#### 9. Contact Form Error Suppression (`lib/actions.ts:243-247`)

**Issue:** Contact form always returns success even when email fails:
```typescript
} catch (error) {
  console.error('Error sending contact form:', error);
  // Still return success if email fails
  return { success: true };
}
```

**Impact:** User may think message was sent when it wasn't.

**Recommendation:** Log the form submission to database as backup, or return a warning.

---

#### 10. Basic Email Validation (`lib/profile-actions.ts:39-41`)

**Issue:** Email validation is minimal:
```typescript
if (!normalizedNewEmail || !normalizedNewEmail.includes('@')) {
  return { success: false, error: 'Invalid email address' };
}
```

**Recommendation:** Use a proper email validation library or regex for more robust validation.

---

### INFORMATIONAL

#### 11. Good: Proper Stripe Webhook Verification

The webhook handler at `app/api/webhooks/stripe/route.ts` correctly:
- Verifies the `stripe-signature` header
- Uses `stripe.webhooks.constructEvent()` for signature verification
- Returns generic errors in production
- Uses proper error handling

---

#### 12. Good: HTML Escaping in Emails (`lib/brevo.ts:506-512`)

The `escapeHtml()` function properly sanitizes user input in emails:
```typescript
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    ...
}
```

---

#### 13. Good: Email Redaction in Logs (`lib/security.ts`)

Production logging properly redacts email addresses and sensitive data.

---

## Security Strengths

### Authentication & Authorization
- Neon Auth provides secure email OTP authentication
- Session management via secure cookies
- Admin functions use `requireAdmin()` checks (with exceptions noted above)
- Proper ownership verification in cancellation flows

### Data Protection
- Email addresses normalized consistently (lowercase, trimmed)
- Prisma ORM prevents SQL injection
- Parameterized queries used for raw SQL (`lib/profile-actions.ts:67-71`)
- PII redaction in production logs

### Payment Security
- Stripe handles all payment processing (no card data stored)
- Webhook signature verification implemented
- Proper refund handling with transaction safety

### HTTP Security Headers (`next.config.ts`)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` with 1-year max-age
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restricts camera/microphone/geolocation

### Code Quality
- TypeScript for type safety
- Consistent error handling patterns
- Transaction-based database operations for data integrity
- Clear separation of concerns (auth, actions, routes)

---

## Recommendations Summary

### Immediate (High Priority)
1. **Fix IDOR in `updateProfile()`** - Add user verification
2. **Add `requireAdmin()` to admin invoice functions** - `getInvoiceOrders`, `markInvoiceAsPaid`, `resendInvoiceEmail`
3. **Run `npm audit fix`** to address dependency vulnerabilities

### Short-term (Medium Priority)
4. Add middleware.ts for route-level auth protection
5. Improve email validation with proper regex
6. Consider distributed rate limiting (Vercel KV/Upstash)

### Long-term (Low Priority)
7. Implement nonce-based CSP if possible
8. Add backup logging for contact form failures
9. Regular dependency updates schedule

---

## Files Audited

| File | Lines | Status |
|------|-------|--------|
| lib/auth/server.ts | 47 | Clean |
| lib/auth/admin.ts | 29 | Clean |
| lib/auth/profile.ts | 92 | Clean |
| lib/registration-actions.ts | 855 | Clean |
| lib/actions.ts | 249 | Minor issue |
| lib/profile-actions.ts | 331 | **IDOR issue** |
| lib/admin-actions.ts | 1452 | **Missing auth checks** |
| lib/coupon-actions.ts | 170 | Clean |
| lib/cancellation-actions.ts | 305 | Clean |
| lib/free-ticket-actions.ts | - | Clean |
| lib/brevo.ts | 514 | Clean |
| lib/stripe.ts | 41 | Clean |
| lib/security.ts | 96 | Clean |
| lib/rate-limit.ts | 127 | Known limitation |
| app/api/webhooks/stripe/route.ts | 353 | Clean |
| app/api/orders/[id]/invoice/route.ts | 54 | Clean |
| next.config.ts | 71 | Clean |
| prisma/schema.prisma | 184 | Clean |
| package.json | 46 | Has vulnerable deps |

---

## Conclusion

The AI Safety Forum website demonstrates good security practices for a Next.js application. The codebase uses industry-standard libraries (Stripe, Prisma, Neon Auth) and follows secure coding patterns. The main issues identified are:

1. One IDOR vulnerability in profile updates (HIGH)
2. Three missing admin authorization checks (MEDIUM)
3. Known dependency vulnerabilities (MEDIUM)

With the recommended fixes implemented, this application would have a solid security posture suitable for production deployment handling sensitive registration and payment data.
