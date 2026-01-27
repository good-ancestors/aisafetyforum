import * as brevo from '@getbrevo/brevo';
import { eventConfig, siteConfig } from './config';

export function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return apiInstance;
}

// ============================================================================
// RECEIPT EMAIL - Sent to purchaser only with payment details
// ============================================================================

interface ReceiptEmailParams {
  // Purchaser info
  purchaserEmail: string;
  purchaserName: string;
  // Order info
  orderNumber: string;
  orderDate: string;
  transactionId?: string | null;
  // Attendees in this order
  attendees: Array<{
    name: string;
    email: string;
    ticketType: string;
    amount: number; // in cents
  }>;
  // Totals
  subtotal: number; // in cents
  discountAmount?: number; // in cents
  discountDescription?: string;
  totalAmount: number; // in cents
}

export async function sendReceiptEmail(params: ReceiptEmailParams) {
  const apiInstance = getBrevoClient();

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Payment Receipt - Australian AI Safety Forum ${eventConfig.year}`;
  sendSmtpEmail.sender = {
    name: 'Australian AI Safety Forum',
    email: eventConfig.organization.email,
  };
  sendSmtpEmail.to = [
    {
      email: params.purchaserEmail,
      name: params.purchaserName,
    },
  ];

  // Build attendee rows for the table
  const attendeeRows = params.attendees
    .map(
      (a) => `
        <tr>
          <td>${escapeHtml(a.name)}<br><span style="font-size: 12px; color: #5c6670;">${escapeHtml(a.email)}</span></td>
          <td>${escapeHtml(a.ticketType)}</td>
          <td style="text-align: right;">$${(a.amount / 100).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  const attendeeRowsText = params.attendees
    .map((a) => `  - ${a.name} (${a.email}): ${a.ticketType} - $${(a.amount / 100).toFixed(2)}`)
    .join('\n');

  // HTML email content
  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a1f5c 0%, #0047ba 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: white; padding: 30px 20px; }
    .receipt-box { background: #f0f4f8; border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0; }
    .footer { background: #0a1f5c; color: white; padding: 20px; text-align: center; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e4e8; }
    th { background: #f0f4f8; font-weight: bold; }
    .total-row td { font-weight: bold; font-size: 16px; color: #0a1f5c; border-top: 2px solid #0a1f5c; }
    .discount-row td { color: #28a745; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Receipt</h1>
      <p>Australian AI Safety Forum ${eventConfig.year}</p>
    </div>

    <div class="content">
      <p>Dear ${escapeHtml(params.purchaserName)},</p>

      <p>Thank you for your purchase! This email confirms your payment for the Australian AI Safety Forum ${eventConfig.year}.</p>

      <div class="receipt-box">
        <p style="margin: 0; font-size: 14px; color: #5c6670;">
          <strong>Receipt Number:</strong> ${params.orderNumber}<br>
          <strong>Date:</strong> ${params.orderDate}<br>
          ${params.transactionId ? `<strong>Transaction ID:</strong> ${params.transactionId}` : ''}
        </p>
      </div>

      <h3 style="color: #0a1f5c;">Order Details</h3>
      <table>
        <tr>
          <th>Attendee</th>
          <th>Ticket Type</th>
          <th style="text-align: right;">Amount (AUD)</th>
        </tr>
        ${attendeeRows}
        ${params.discountAmount && params.discountAmount > 0 ? `
        <tr class="discount-row">
          <td colspan="2">Discount${params.discountDescription ? ` (${escapeHtml(params.discountDescription)})` : ''}</td>
          <td style="text-align: right;">-$${(params.discountAmount / 100).toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td colspan="2">Total (inc. GST)</td>
          <td style="text-align: right;">$${(params.totalAmount / 100).toFixed(2)}</td>
        </tr>
      </table>

      <p style="font-size: 14px; color: #5c6670;">
        Each attendee listed above will receive a separate confirmation email with event details and a calendar invite.
      </p>

      <p>If you have any questions about your order, please contact us at
        <a href="mailto:${eventConfig.organization.email}">${eventConfig.organization.email}</a>
      </p>

      <p>Best regards,<br>
      <strong>The Australian AI Safety Forum Team</strong></p>
    </div>

    <div class="footer">
      <p>${eventConfig.organization.name}<br>
      ABN ${eventConfig.organization.abn}<br>
      ${eventConfig.organization.address.line1}, ${eventConfig.organization.address.city} ${eventConfig.organization.address.postcode}</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version
  sendSmtpEmail.textContent = `
Payment Receipt - Australian AI Safety Forum ${eventConfig.year}

Dear ${params.purchaserName},

Thank you for your purchase! This email confirms your payment for the Australian AI Safety Forum ${eventConfig.year}.

RECEIPT DETAILS
---------------
Receipt Number: ${params.orderNumber}
Date: ${params.orderDate}
${params.transactionId ? `Transaction ID: ${params.transactionId}` : ''}

ORDER DETAILS
-------------
${attendeeRowsText}
${params.discountAmount && params.discountAmount > 0 ? `Discount${params.discountDescription ? ` (${params.discountDescription})` : ''}: -$${(params.discountAmount / 100).toFixed(2)}\n` : ''}
Total (inc. GST): $${(params.totalAmount / 100).toFixed(2)}

Each attendee listed above will receive a separate confirmation email with event details and a calendar invite.

If you have any questions about your order, please contact us at ${eventConfig.organization.email}

Best regards,
The Australian AI Safety Forum Team

${eventConfig.organization.name}
ABN ${eventConfig.organization.abn}
  `.trim();

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Receipt email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    throw error;
  }
}

// ============================================================================
// TICKET CONFIRMATION EMAIL - Sent to each attendee with event details
// ============================================================================

interface TicketConfirmationEmailParams {
  // Attendee info
  email: string;
  name: string;
  ticketType: string;
  // Optional: who purchased this ticket (for group orders)
  purchaserEmail?: string | null;
  purchaserName?: string | null;
}

export async function sendTicketConfirmationEmail(params: TicketConfirmationEmailParams) {
  const apiInstance = getBrevoClient();

  // Generate calendar event (.ics file content)
  const calendarEvent = generateCalendarInvite({
    name: params.name,
    email: params.email,
  });

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  const isPurchasedByOther = params.purchaserName &&
    params.purchaserEmail &&
    params.purchaserEmail.toLowerCase() !== params.email.toLowerCase();

  sendSmtpEmail.subject = isPurchasedByOther
    ? `You're Registered! Australian AI Safety Forum ${eventConfig.year}`
    : `Registration Confirmed - Australian AI Safety Forum ${eventConfig.year}`;
  sendSmtpEmail.sender = {
    name: 'Australian AI Safety Forum',
    email: eventConfig.organization.email,
  };
  sendSmtpEmail.to = [
    {
      email: params.email,
      name: params.name,
    },
  ];

  const dashboardUrl = `${siteConfig.url}/dashboard`;

  // HTML email content
  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a1f5c 0%, #0047ba 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: white; padding: 30px 20px; }
    .event-box { background: #f0f4f8; border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0; }
    .ticket-badge { display: inline-block; background: #0a1f5c; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
    .footer { background: #0a1f5c; color: white; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #00d4ff; color: #061440; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
    .button-secondary { display: inline-block; background: white; color: #0a1f5c; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; border: 2px solid #0a1f5c; }
    .action-box { background: #e8f4fd; border: 1px solid #00d4ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ${isPurchasedByOther ? "You're Registered!" : 'Registration Confirmed!'}</h1>
      <p>Australian AI Safety Forum ${eventConfig.year}</p>
    </div>

    <div class="content">
      <p>Dear ${escapeHtml(params.name)},</p>

      ${isPurchasedByOther
        ? `<p>Great news! <strong>${escapeHtml(params.purchaserName!)}</strong> has registered you for the Australian AI Safety Forum ${eventConfig.year}.</p>`
        : `<p>Thank you for registering for the Australian AI Safety Forum ${eventConfig.year}! We're excited to have you join us.</p>`
      }

      <p class="ticket-badge">${escapeHtml(params.ticketType)} Ticket</p>

      <div class="event-box">
        <h3 style="margin-top: 0; color: #0a1f5c;">📅 Event Details</h3>
        <p style="margin-bottom: 0;">
          <strong>Dates:</strong> ${eventConfig.datesLong}<br>
          <strong>Time:</strong> ${eventConfig.startTime} - ${eventConfig.endTime} AEST<br>
          <strong>Location:</strong> ${eventConfig.venueLong}
        </p>
      </div>

      <div class="action-box">
        <h3 style="margin-top: 0; color: #0a1f5c;">Complete Your Profile</h3>
        <p style="margin-bottom: 15px;">Log in to view your ticket, update your profile, and access event materials.</p>
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
      </div>

      <h3 style="color: #0a1f5c;">📋 What's Next?</h3>
      <ul>
        <li><strong>Add to Calendar</strong> - Use the attached .ics file to add the event to your calendar</li>
        <li><strong>Complete Your Profile</strong> - Log in to update your bio and connect with other attendees</li>
        <li><strong>Stay Tuned</strong> - We'll send program updates and logistics info closer to the event</li>
      </ul>

      <p>If you have any questions, please contact us at
        <a href="mailto:${eventConfig.organization.email}">${eventConfig.organization.email}</a>
      </p>

      <p>We look forward to seeing you at the forum!</p>

      <p>Best regards,<br>
      <strong>The Australian AI Safety Forum Team</strong></p>
    </div>

    <div class="footer">
      <p>${eventConfig.organization.name}<br>
      ABN ${eventConfig.organization.abn}<br>
      ${eventConfig.organization.address.line1}, ${eventConfig.organization.address.city} ${eventConfig.organization.address.postcode}</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version
  sendSmtpEmail.textContent = `
${isPurchasedByOther ? "You're Registered!" : 'Registration Confirmed'} - Australian AI Safety Forum ${eventConfig.year}

Dear ${params.name},

${isPurchasedByOther
  ? `Great news! ${params.purchaserName} has registered you for the Australian AI Safety Forum ${eventConfig.year}.`
  : `Thank you for registering for the Australian AI Safety Forum ${eventConfig.year}! We're excited to have you join us.`
}

Your Ticket: ${params.ticketType}

EVENT DETAILS
-------------
Dates: ${eventConfig.datesLong}
Time: ${eventConfig.startTime} - ${eventConfig.endTime} AEST
Location: ${eventConfig.venueLong}

COMPLETE YOUR PROFILE
---------------------
Log in to view your ticket, update your profile, and access event materials:
${dashboardUrl}

WHAT'S NEXT?
------------
- Add to Calendar: Use the attached .ics file to add the event to your calendar
- Complete Your Profile: Log in to update your bio and connect with other attendees
- Stay Tuned: We'll send program updates and logistics info closer to the event

If you have any questions, please contact us at ${eventConfig.organization.email}

We look forward to seeing you at the forum!

Best regards,
The Australian AI Safety Forum Team

${eventConfig.organization.name}
ABN ${eventConfig.organization.abn}
  `.trim();

  // Attach calendar invite
  sendSmtpEmail.attachment = [
    {
      name: `Australian_AI_Safety_Forum_${eventConfig.year}.ics`,
      content: Buffer.from(calendarEvent).toString('base64'),
    },
  ];

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Ticket confirmation email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending ticket confirmation email:', error);
    throw error;
  }
}

// ============================================================================
// INVOICE EMAIL - Sent to purchaser with invoice PDF
// ============================================================================

interface InvoiceEmailParams {
  email: string;
  name: string;
  organisation?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number; // in cents
  attendeeCount: number;
  poNumber?: string | null;
  pdfBuffer: Buffer;
}

export async function sendInvoiceEmail(params: InvoiceEmailParams) {
  const apiInstance = getBrevoClient();

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Invoice ${params.invoiceNumber} - Australian AI Safety Forum ${eventConfig.year}`;
  sendSmtpEmail.sender = {
    name: 'Australian AI Safety Forum',
    email: eventConfig.organization.email,
  };
  sendSmtpEmail.to = [
    {
      email: params.email,
      name: params.name,
    },
  ];

  const bankDetails = eventConfig.organization.bankDetails;

  // HTML email content
  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a1f5c 0%, #0047ba 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: white; padding: 30px 20px; }
    .invoice-box { background: #f0f4f8; border-left: 4px solid #0a1f5c; padding: 20px; margin: 20px 0; }
    .bank-box { background: #e8f4fd; border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0; }
    .footer { background: #0a1f5c; color: white; padding: 20px; text-align: center; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e0e4e8; }
    th { background: transparent; font-weight: normal; color: #5c6670; }
    td { font-weight: bold; }
    .important { color: #d9534f; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tax Invoice</h1>
      <p>Australian AI Safety Forum ${eventConfig.year}</p>
    </div>

    <div class="content">
      <p>Dear ${params.name},</p>

      <p>Please find attached your tax invoice for ${params.attendeeCount} ticket${params.attendeeCount !== 1 ? 's' : ''} to the Australian AI Safety Forum ${eventConfig.year}.</p>

      <div class="invoice-box">
        <h3 style="margin-top: 0; color: #0a1f5c;">Invoice Summary</h3>
        <table>
          <tr>
            <th>Invoice Number</th>
            <td>${params.invoiceNumber}</td>
          </tr>
          <tr>
            <th>Invoice Date</th>
            <td>${params.invoiceDate}</td>
          </tr>
          <tr>
            <th>Due Date</th>
            <td class="important">${params.dueDate}</td>
          </tr>
          ${params.poNumber ? `<tr><th>PO Number</th><td>${params.poNumber}</td></tr>` : ''}
          <tr>
            <th>Amount Due</th>
            <td style="font-size: 18px; color: #0a1f5c;">$${(params.totalAmount / 100).toFixed(2)} AUD</td>
          </tr>
        </table>
      </div>

      <div class="bank-box">
        <h3 style="margin-top: 0; color: #0a1f5c;">Payment Details - Bank Transfer</h3>
        <table>
          <tr>
            <th>Account Name</th>
            <td>${bankDetails.accountName}</td>
          </tr>
          <tr>
            <th>BSB</th>
            <td>${bankDetails.bsb}</td>
          </tr>
          <tr>
            <th>Account Number</th>
            <td>${bankDetails.accountNumber}</td>
          </tr>
          <tr>
            <th>Bank</th>
            <td>${bankDetails.bank}</td>
          </tr>
          <tr>
            <th>Reference</th>
            <td class="important">${params.invoiceNumber}</td>
          </tr>
        </table>
        <p style="margin-bottom: 0; font-size: 14px; color: #5c6670;">
          <strong>Important:</strong> Please use the invoice number as your payment reference so we can identify your payment.
        </p>
      </div>

      <h3 style="color: #0a1f5c;">What happens next?</h3>
      <ol>
        <li>Transfer the amount to the bank account above</li>
        <li>Use <strong>${params.invoiceNumber}</strong> as the payment reference</li>
        <li>Once we receive your payment, we'll confirm your registration</li>
        <li>Each attendee will receive a confirmation email with event details</li>
      </ol>

      <p>If you have any questions, please contact us at
        <a href="mailto:${eventConfig.organization.email}">${eventConfig.organization.email}</a>
      </p>

      <p>Best regards,<br>
      <strong>The Australian AI Safety Forum Team</strong></p>
    </div>

    <div class="footer">
      <p>${eventConfig.organization.name}<br>
      ABN ${eventConfig.organization.abn}<br>
      ${eventConfig.organization.address.line1}, ${eventConfig.organization.address.city} ${eventConfig.organization.address.postcode}</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version
  sendSmtpEmail.textContent = `
Tax Invoice - Australian AI Safety Forum ${eventConfig.year}

Dear ${params.name},

Please find attached your tax invoice for ${params.attendeeCount} ticket${params.attendeeCount !== 1 ? 's' : ''} to the Australian AI Safety Forum ${eventConfig.year}.

INVOICE SUMMARY
---------------
Invoice Number: ${params.invoiceNumber}
Invoice Date: ${params.invoiceDate}
Due Date: ${params.dueDate}
${params.poNumber ? `PO Number: ${params.poNumber}\n` : ''}Amount Due: $${(params.totalAmount / 100).toFixed(2)} AUD

PAYMENT DETAILS - BANK TRANSFER
-------------------------------
Account Name: ${bankDetails.accountName}
BSB: ${bankDetails.bsb}
Account Number: ${bankDetails.accountNumber}
Bank: ${bankDetails.bank}
Reference: ${params.invoiceNumber}

IMPORTANT: Please use the invoice number as your payment reference.

WHAT HAPPENS NEXT?
1. Transfer the amount to the bank account above
2. Use ${params.invoiceNumber} as the payment reference
3. Once we receive your payment, we'll confirm your registration
4. Each attendee will receive a confirmation email with event details

If you have any questions, please contact us at ${eventConfig.organization.email}

Best regards,
The Australian AI Safety Forum Team

${eventConfig.organization.name}
ABN ${eventConfig.organization.abn}
  `.trim();

  // Attach PDF invoice
  sendSmtpEmail.attachment = [
    {
      name: `${params.invoiceNumber}.pdf`,
      content: params.pdfBuffer.toString('base64'),
    },
  ];

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Invoice email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateCalendarInvite(params: { name: string; email: string }): string {
  // Format dates for iCalendar (YYYYMMDD format with time)
  const startDate = `${eventConfig.day1.isoDate.replace(/-/g, '')}T${eventConfig.startTime.replace(':', '')}00`;
  const endDate = `${eventConfig.day2.isoDate.replace(/-/g, '')}T${eventConfig.endTime.replace(':', '')}00`;
  const now = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Australian AI Safety Forum//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:aisf2026-${now}@aisafetyforum.org.au
DTSTAMP:${now}
DTSTART;TZID=Australia/Sydney:${startDate}
DTEND;TZID=Australia/Sydney:${endDate}
SUMMARY:Australian AI Safety Forum ${eventConfig.year}
DESCRIPTION:Join us for the Australian AI Safety Forum ${eventConfig.year}.\\n\\nThis two-day event brings together researchers\\, policymakers\\, and industry leaders to discuss the latest developments in AI safety.\\n\\nFor more information\\, visit: ${siteConfig.url}
LOCATION:${eventConfig.venueLong}
STATUS:CONFIRMED
ORGANIZER;CN=Australian AI Safety Forum:mailto:${eventConfig.organization.email}
ATTENDEE;CN=${params.name};RSVP=TRUE:mailto:${params.email}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: Australian AI Safety Forum tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');
}

/**
 * Send a contact form notification email to the team
 */
interface ContactFormEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormNotification(params: ContactFormEmailParams): Promise<void> {
  try {
    const apiInstance = getBrevoClient();

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = `[Contact Form] ${params.subject}`;
    sendSmtpEmail.sender = {
      name: 'Australian AI Safety Forum',
      email: eventConfig.organization.email,
    };
    sendSmtpEmail.to = [
      { email: eventConfig.organization.email, name: 'AI Safety Forum Team' },
    ];
    sendSmtpEmail.replyTo = { email: params.email, name: params.name };
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #0a1f5c 0%, #0047ba 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e0e4e8; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e0e4e8; font-weight: bold; width: 100px;">From:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e0e4e8;">${escapeHtml(params.name)} &lt;${escapeHtml(params.email)}&gt;</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e0e4e8; font-weight: bold;">Subject:</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e0e4e8;">${escapeHtml(params.subject)}</td>
      </tr>
    </table>

    <div style="margin-top: 20px;">
      <p style="font-weight: bold; margin-bottom: 10px;">Message:</p>
      <div style="background: white; padding: 20px; border-radius: 4px; border: 1px solid #e0e4e8; white-space: pre-wrap;">${escapeHtml(params.message)}</div>
    </div>

    <p style="margin-top: 20px; font-size: 14px; color: #5c6670;">
      Reply directly to this email to respond to ${escapeHtml(params.name)}.
    </p>
  </div>
</body>
</html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Contact form notification sent to team');
  } catch (error) {
    console.error('Error sending contact form notification:', error);
    throw error;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
