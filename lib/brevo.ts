import * as brevo from '@getbrevo/brevo';
import { eventConfig } from './config';

export function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return apiInstance;
}

interface RegistrationEmailParams {
  email: string;
  name: string;
  ticketType: string;
  organisation?: string | null;
  receiptNumber: string;
  receiptDate: string;
  amountPaid: number;
  transactionId?: string | null;
}

export async function sendConfirmationEmail(params: RegistrationEmailParams) {
  const apiInstance = getBrevoClient();

  // Generate calendar event (.ics file content)
  const calendarEvent = generateCalendarInvite({
    name: params.name,
    email: params.email,
  });

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Registration Confirmed - Australian AI Safety Forum ${eventConfig.year}`;
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
    .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .footer { background: #0a1f5c; color: white; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #00d4ff; color: #061440; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e4e8; }
    th { background: #f0f4f8; font-weight: bold; }
    .total { font-size: 18px; font-weight: bold; color: #0a1f5c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Registration Confirmed!</h1>
      <p>Australian AI Safety Forum ${eventConfig.year}</p>
    </div>

    <div class="content">
      <p>Dear ${params.name},</p>

      <p>Thank you for registering for the Australian AI Safety Forum ${eventConfig.year}!</p>

      <div class="receipt-box">
        <h3 style="margin-top: 0; color: #0a1f5c;">Event Details</h3>
        <p><strong>Dates:</strong> ${eventConfig.datesLong}<br>
        <strong>Time:</strong> ${eventConfig.startTime} - ${eventConfig.endTime} AEST<br>
        <strong>Location:</strong> ${eventConfig.venueLong}</p>
      </div>

      <h3 style="color: #0a1f5c;">Your Registration</h3>
      <table>
        <tr>
          <th>Item</th>
          <th>Amount (AUD)</th>
        </tr>
        <tr>
          <td>${params.ticketType} Ticket</td>
          <td>$${(params.amountPaid / 100).toFixed(2)}</td>
        </tr>
        <tr>
          <td class="total">Total (inc. GST)</td>
          <td class="total">$${(params.amountPaid / 100).toFixed(2)}</td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #666;">
        Receipt Number: ${params.receiptNumber}<br>
        Date: ${params.receiptDate}<br>
        ${params.transactionId ? `Transaction ID: ${params.transactionId}` : ''}
      </p>

      <h3 style="color: #0a1f5c;">What's Next?</h3>
      <ul>
        <li>Add the event to your calendar using the attached .ics file</li>
        <li>We'll send program updates closer to the event</li>
        <li>Look out for logistics information about venue access and parking</li>
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
Registration Confirmed - Australian AI Safety Forum ${eventConfig.year}

Dear ${params.name},

Thank you for registering for the Australian AI Safety Forum ${eventConfig.year}!

Event Details:
- Dates: ${eventConfig.datesLong}
- Time: ${eventConfig.startTime} - ${eventConfig.endTime} AEST
- Location: ${eventConfig.venueLong}

Your Registration:
${params.ticketType} Ticket: $${(params.amountPaid / 100).toFixed(2)}
Total (inc. GST): $${(params.amountPaid / 100).toFixed(2)}

Receipt Number: ${params.receiptNumber}
Date: ${params.receiptDate}
${params.transactionId ? `Transaction ID: ${params.transactionId}` : ''}

What's Next?
- Add the event to your calendar using the attached .ics file
- We'll send program updates closer to the event
- Look out for logistics information about venue access and parking

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
      name: 'Australian_AI_Safety_Forum_2026.ics',
      content: Buffer.from(calendarEvent).toString('base64'),
    },
  ];

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Confirmation email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}

function generateCalendarInvite(params: { name: string; email: string }): string {
  // Format dates for iCalendar (YYYYMMDD format with time)
  const startDate = `${eventConfig.day1.isoDate.replace(/-/g, '')}T${eventConfig.startTime.replace(':', '')}00`;
  const endDate = `${eventConfig.day2.isoDate.replace(/-/g, '')}T${eventConfig.endTime.replace(':', '')}00`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

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
DESCRIPTION:Join us for the Australian AI Safety Forum ${eventConfig.year}.\\n\\nThis two-day event brings together researchers\\, policymakers\\, and industry leaders to discuss the latest developments in AI safety.\\n\\nFor more information\\, visit: https://aisafetyforum.org.au
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
