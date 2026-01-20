# Email and Receipt Setup Guide

This guide covers the email confirmation system and tax receipt functionality for the AI Safety Forum registration system.

## Overview

The system provides:
1. **Stripe automatic receipts** - Basic payment confirmations from Stripe
2. **Brevo confirmation emails** - Branded emails with calendar invites
3. **Tax receipts** - Australian tax-compliant receipts displayed on success page

---

## 1. Stripe Automatic Receipts

Stripe can automatically send receipt emails for successful payments.

### Enable in Stripe Dashboard

1. Go to [Stripe Dashboard → Settings → Customer emails](https://dashboard.stripe.com/settings/emails)
2. Under "Email customers about":
   - ✅ Enable "Successful payments"
   - ✅ Enable "Refunds" (optional)
3. Click "Save"

### What Stripe Sends

- Basic payment receipt with amount and payment method
- Stripe-branded email
- Receipt URL for downloading PDF receipt
- Automatic for all successful Checkout sessions

**Note**: These are basic receipts. For branded confirmation emails with event details and calendar invites, the system uses Brevo (see below).

---

## 2. Brevo Confirmation Emails

Brevo sends branded confirmation emails with:
- Event details and dates
- Registration information
- Calendar invite (.ics file attachment)
- Full tax receipt details in email

### Setup

1. **Brevo Account**:
   - Log in to [Brevo](https://app.brevo.com)
   - Navigate to Settings → SMTP & API
   - Copy your API key

2. **Configure Environment Variable**:
   ```env
   BREVO_API_KEY="xkeysib-your-api-key-here"
   ```

3. **Verify Sender Domain** (Production):
   - In Brevo Dashboard → Senders → Domains
   - Add and verify `aisafetyforum.org.au`
   - Update `from` email in `lib/config.ts`

### Current Configuration

**Sender**: contact@goodancestors.org.au (temporary - change when aisafetyforum.org.au domain is configured)

**Email includes**:
- Welcome message
- Event details (dates, time, location)
- Registration summary with amount paid
- Receipt information
- Calendar invite (.ics attachment)
- Next steps and contact information

### When Emails Are Sent

Emails are sent automatically via webhook when:
- Payment is successful (`checkout.session.completed` event)
- Registration status updates to "paid"

See: `app/api/webhooks/stripe/route.ts:57-82`

### Testing Emails

Use Brevo's test mode or send to your own email:

```bash
# Complete a test registration
npm run dev
# Go to http://localhost:3000/register
# Use test card: 4242 4242 4242 4242
# Check your email inbox
```

### Email Deliverability

**For Production**:
1. Verify your domain in Brevo
2. Set up SPF and DKIM records
3. Monitor bounce and complaint rates in Brevo dashboard
4. Use your own domain email address (e.g., noreply@aisafetyforum.org.au)

---

## 3. Tax Receipts

Tax receipts are displayed on the registration success page and include:
- Organization details (Gradient Institute Ltd, ABN)
- Attendee information
- Event details
- Amount paid with GST breakdown
- Receipt number and date
- Print functionality

### Receipt Display

Tax receipts appear automatically on:
- `/register/success?session_id=...` (after Stripe payment)
- `/register/success?registration_id=...` (direct access)

Component: `components/TaxReceipt.tsx`

### Receipt Information

**Organization Details** (from `lib/config.ts`):
```
Gradient Institute Ltd
ABN: 29 631 761 469
Sydney Knowledge Hub
Level 2 H04 Merewether
The University Of Sydney
NSW, 2006, Australia
```

**Receipt Number Format**: `AISF-{LAST_8_CHARS_OF_REGISTRATION_ID}`

Example: `AISF-4IXTWWPD`

### GST Calculation

All ticket prices include 10% GST:
- Display: `Total (inc. GST): $595.00`
- GST amount: `$54.09` (shown separately)

### Print Functionality

Users can print their receipt using the "Print Receipt" button:
- Formats as A4 page
- Removes navigation and other page elements
- Professional tax receipt layout

---

## Configuration Files

### Event Config (`lib/config.ts`)

Update these values as needed:

```typescript
export const eventConfig = {
  year: '2026',
  dates: '22-23 June',
  datesLong: '22-23 June 2026',
  venue: 'Sydney',
  venueLong: 'The University of Sydney, Sydney, Australia',

  day1: {
    date: '22 June 2026',
    isoDate: '2026-06-22',
  },
  day2: {
    date: '23 June 2026',
    isoDate: '2026-06-23',
  },

  startTime: '09:00',
  endTime: '17:00',

  organization: {
    name: 'Gradient Institute Ltd',
    abn: '29 631 761 469',
    address: { /* ... */ },
    email: 'contact@goodancestors.org.au',
  },
};
```

### Email Templates (`lib/brevo.ts`)

To customize email content:
1. Edit `sendConfirmationEmail()` function
2. Update HTML and text content
3. Modify calendar invite details in `generateCalendarInvite()`

---

## Calendar Invites

The system automatically generates .ics calendar files with:

**Event Details**:
- Title: Australian AI Safety Forum 2026
- Dates: 22-23 June 2026
- Time: 09:00 - 17:00 AEST
- Location: The University of Sydney, Sydney, Australia
- Organizer: Australian AI Safety Forum
- Reminder: 1 day before event

**Timezone**: Australia/Sydney (automatically handles AEST/AEDT)

**Format**: iCalendar (.ics) - compatible with Google Calendar, Outlook, Apple Calendar, etc.

---

## Troubleshooting

### Emails Not Sending

1. **Check Brevo API Key**:
   ```bash
   echo $BREVO_API_KEY
   ```

2. **Check Webhook Logs**:
   - Look for "✅ Confirmation email sent" in server logs
   - Check for error messages: "❌ Error sending confirmation email"

3. **Verify in Brevo Dashboard**:
   - Go to Transactional → Logs
   - Check send status and delivery

4. **Test Brevo Connection**:
   ```bash
   # Create test script
   npx ts-node -e "
   import { sendConfirmationEmail } from './lib/brevo';
   sendConfirmationEmail({
     email: 'your@email.com',
     name: 'Test User',
     ticketType: 'Standard',
     organisation: null,
     receiptNumber: 'AISF-TEST123',
     receiptDate: '20 January 2026',
     amountPaid: 59500,
     transactionId: 'pi_test123',
   }).then(() => console.log('Success')).catch(console.error);
   "
   ```

### Tax Receipt Not Showing

1. **Check Registration Status**: Only shows for `status: 'paid'`
2. **Check URL Parameters**: Needs `session_id` or `registration_id`
3. **Check Console**: Look for errors in browser console

### Stripe Receipts Not Sending

1. Verify "Successful payments" is enabled in Stripe Dashboard
2. Check Stripe Dashboard → Events for webhook status
3. Ensure customer email is captured in checkout session

---

## Production Checklist

Before going live:

- [ ] Configure aisafetyforum.org.au domain in Brevo
- [ ] Verify sender domain with SPF/DKIM
- [ ] Update sender email in `lib/config.ts`
- [ ] Enable Stripe automatic receipts in dashboard
- [ ] Test full flow end-to-end with real email
- [ ] Verify calendar invite works across clients
- [ ] Test tax receipt printing
- [ ] Monitor Brevo deliverability rates
- [ ] Set up Stripe live mode webhooks
- [ ] Update Brevo API key for production

---

## Monitoring

**Brevo Dashboard**:
- Monitor: Transactional → Statistics
- Check: Open rates, click rates, bounces
- Alert on: Delivery failures

**Stripe Dashboard**:
- Monitor: Payments → All payments
- Check: Receipt sent status
- Alert on: Failed payments

**Server Logs**:
- Search for: "Confirmation email sent"
- Alert on: Email send errors
- Monitor: Webhook processing times

---

## Support

For issues:
- **Brevo**: [Brevo Support](https://help.brevo.com)
- **Stripe**: [Stripe Support](https://support.stripe.com)
- **Code**: Check `app/api/webhooks/stripe/route.ts` and `lib/brevo.ts`

Related documentation:
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Webhook configuration
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Stripe integration
