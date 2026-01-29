import { type NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/server';
import { eventConfig } from '@/lib/config';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentifier, rateLimitPresets } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`invoice:${clientId}`, rateLimitPresets.document);
  if (!rateLimit.success) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get the order with registrations
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      registrations: true,
      coupon: true,
    },
  });

  if (!order) {
    return new NextResponse('Order not found', { status: 404 });
  }

  // Check if user is the purchaser OR an admin
  const userIsAdmin = await isAdmin(user.email);
  if (order.purchaserEmail.toLowerCase() !== user.email.toLowerCase() && !userIsAdmin) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  // Check if this is an invoice order
  if (order.paymentMethod !== 'invoice') {
    return new NextResponse('This is not an invoice order', { status: 400 });
  }

  // Generate HTML invoice
  const invoiceHtml = generateInvoiceHtml(order);

  return new NextResponse(invoiceHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

interface OrderWithDetails {
  id: string;
  purchaserEmail: string;
  purchaserName: string;
  invoiceNumber: string | null;
  invoiceDueDate: Date | null;
  totalAmount: number;
  discountAmount: number;
  orgName: string | null;
  orgABN: string | null;
  poNumber: string | null;
  paymentStatus: string;
  createdAt: Date;
  registrations: Array<{
    id: string;
    name: string;
    email: string;
    ticketType: string;
    ticketPrice: number | null;
  }>;
  coupon: {
    code: string;
    description: string;
  } | null;
}

// --- Helper functions for HTML generation ---

function getInvoiceStyles(): string {
  return `
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0a1f5c;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0a1f5c;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      margin: 0;
      font-size: 32px;
      color: #0a1f5c;
    }
    .invoice-number {
      color: #6b7280;
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    .status-paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .detail-section h3 {
      margin: 0 0 12px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }
    .detail-section p {
      margin: 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      padding: 12px;
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    .totals {
      margin-top: 20px;
      border-top: 2px solid #e5e7eb;
      padding-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #0a1f5c;
      border-top: 2px solid #0a1f5c;
      margin-top: 8px;
      padding-top: 16px;
    }
    .payment-info {
      background: #f0f4f8;
      padding: 20px;
      border-radius: 8px;
      margin-top: 40px;
    }
    .payment-info h3 {
      margin: 0 0 12px 0;
      color: #0a1f5c;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #0a1f5c;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-button:hover {
      background: #061440;
    }
  `;
}

function generateTicketRows(
  registrations: OrderWithDetails['registrations']
): string {
  const ticketSummary = registrations.reduce((acc, reg) => {
    const key = reg.ticketType;
    if (!acc[key]) {
      acc[key] = { count: 0, unitPrice: reg.ticketPrice || 0, total: 0 };
    }
    acc[key].count++;
    acc[key].total += reg.ticketPrice || 0;
    return acc;
  }, {} as Record<string, { count: number; unitPrice: number; total: number }>);

  return Object.entries(ticketSummary)
    .map(
      ([type, { count, unitPrice, total }]) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(type)} Ticket${count > 1 ? ` (x${count})` : ''}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(unitPrice / 100).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(total / 100).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');
}

function generateAttendeeList(
  registrations: OrderWithDetails['registrations']
): string {
  return registrations
    .map(
      (reg) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(reg.name)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(reg.email)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${escapeHtml(reg.ticketType)}</td>
      </tr>
    `
    )
    .join('');
}

function generateTotalsSection(order: OrderWithDetails, isPaid: boolean): string {
  const subtotal = order.totalAmount + order.discountAmount;
  const gstAmount = Math.round(order.totalAmount / 11);
  const subtotalExGst = order.totalAmount - gstAmount;

  const discountRows = order.discountAmount > 0 ? `
    <div class="total-row">
      <span>Subtotal (before discount)</span>
      <span>$${(subtotal / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row" style="color: #059669;">
      <span>Discount${order.coupon ? ` (${order.coupon.code})` : ''}</span>
      <span>-$${(order.discountAmount / 100).toFixed(2)} AUD</span>
    </div>
  ` : '';

  return `
  <div class="totals">
    ${discountRows}
    <div class="total-row">
      <span>Subtotal (ex GST)</span>
      <span>$${(subtotalExGst / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row">
      <span>GST (10%)</span>
      <span>$${(gstAmount / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row grand-total">
      <span>Total ${isPaid ? 'Paid' : 'Due'} (inc GST)</span>
      <span>$${(order.totalAmount / 100).toFixed(2)} AUD</span>
    </div>
  </div>
  `;
}

function generatePaymentInstructions(order: OrderWithDetails): string {
  return `
  <div class="payment-info">
    <h3>Payment Instructions</h3>
    <p>Please pay by bank transfer to:</p>
    <p><strong>Account Name:</strong> ${eventConfig.organization.bankDetails.accountName}</p>
    <p><strong>BSB:</strong> ${eventConfig.organization.bankDetails.bsb}</p>
    <p><strong>Account Number:</strong> ${eventConfig.organization.bankDetails.accountNumber}</p>
    <p><strong>Bank:</strong> ${eventConfig.organization.bankDetails.bank}</p>
    <p><strong>Reference:</strong> ${order.invoiceNumber || order.id.slice(-8).toUpperCase()}</p>
    ${order.invoiceDueDate ? `<p style="margin-top: 12px;"><strong>Please pay by:</strong> ${new Date(order.invoiceDueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
  </div>
  `;
}

// --- Main HTML generation function ---

function generateInvoiceHtml(order: OrderWithDetails): string {
  const isPaid = order.paymentStatus === 'paid';
  const ticketRows = generateTicketRows(order.registrations);
  const attendeeList = generateAttendeeList(order.registrations);
  const totalsSection = generateTotalsSection(order, isPaid);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${order.invoiceNumber || order.id.slice(-8).toUpperCase()}</title>
  <style>${getInvoiceStyles()}</style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save PDF</button>

  <div class="invoice-header">
    <div class="logo">
      Australian AI Safety Forum<br>
      <span style="font-size: 14px; font-weight: normal; color: #6b7280;">${eventConfig.year}</span><br>
      <span style="font-size: 12px; font-weight: normal; color: #6b7280;">Organised by ${eventConfig.organization.name}</span><br>
      <span style="font-size: 12px; font-weight: normal; color: #6b7280;">ABN: ${eventConfig.organization.abn}</span>
    </div>
    <div class="invoice-title">
      <h1>TAX INVOICE</h1>
      <p class="invoice-number">${order.invoiceNumber || `#${order.id.slice(-8).toUpperCase()}`}</p>
      <span class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
        ${isPaid ? 'PAID' : 'AWAITING PAYMENT'}
      </span>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-section">
      <h3>Bill To</h3>
      <p><strong>${escapeHtml(order.purchaserName)}</strong></p>
      ${order.orgName ? `<p>${escapeHtml(order.orgName)}</p>` : ''}
      ${order.orgABN ? `<p>ABN: ${escapeHtml(order.orgABN)}</p>` : ''}
      <p>${escapeHtml(order.purchaserEmail)}</p>
      ${order.poNumber ? `<p>PO Number: ${escapeHtml(order.poNumber)}</p>` : ''}
    </div>
    <div class="detail-section" style="text-align: right;">
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      ${order.invoiceDueDate ? `<p><strong>Due Date:</strong> ${new Date(order.invoiceDueDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
    </div>
  </div>

  <h3 style="margin-bottom: 16px; color: #0a1f5c;">Order Summary</h3>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${ticketRows}
    </tbody>
  </table>

  ${totalsSection}

  <h3 style="margin: 40px 0 16px 0; color: #0a1f5c;">Attendee Details</h3>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th style="text-align: left;">Ticket Type</th>
      </tr>
    </thead>
    <tbody>
      ${attendeeList}
    </tbody>
  </table>

  ${!isPaid ? generatePaymentInstructions(order) : ''}

  <div class="footer">
    <p>Australian AI Safety Forum ${eventConfig.year}</p>
    <p>${eventConfig.datesLong} • ${eventConfig.venueLong}</p>
    <p>Questions? Contact us at ${eventConfig.organization.email}</p>
  </div>
</body>
</html>
  `;
}
