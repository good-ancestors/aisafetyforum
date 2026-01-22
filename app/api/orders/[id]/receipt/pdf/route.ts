import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { isAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { eventConfig } from '@/lib/config';
import { checkRateLimit, getClientIdentifier, rateLimitPresets } from '@/lib/rate-limit';
import { escapeHtml } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`receipt:${clientId}`, rateLimitPresets.document);
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

  // Check if this is a card payment (receipt) order
  if (order.paymentMethod !== 'card') {
    return new NextResponse('This is not a card payment order. Use the invoice endpoint for invoice orders.', { status: 400 });
  }

  // Check if paid
  if (order.paymentStatus !== 'paid') {
    return new NextResponse('Order not paid', { status: 400 });
  }

  // Generate HTML receipt
  const receiptHtml = generateReceiptHtml(order);

  return new NextResponse(receiptHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

interface OrderWithDetails {
  id: string;
  purchaserEmail: string;
  purchaserName: string;
  totalAmount: number;
  discountAmount: number;
  paymentStatus: string;
  createdAt: Date;
  stripePaymentId: string | null;
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

function generateReceiptHtml(order: OrderWithDetails): string {
  const subtotal = order.totalAmount + order.discountAmount;

  // GST calculation (prices include 10% GST)
  const gstAmount = Math.round(order.totalAmount / 11);
  const subtotalExGst = order.totalAmount - gstAmount;

  // Group tickets by type and count them
  const ticketSummary = order.registrations.reduce((acc, reg) => {
    const key = reg.ticketType;
    if (!acc[key]) {
      acc[key] = { count: 0, unitPrice: reg.ticketPrice || 0, total: 0 };
    }
    acc[key].count++;
    acc[key].total += reg.ticketPrice || 0;
    return acc;
  }, {} as Record<string, { count: number; unitPrice: number; total: number }>);

  const ticketRows = Object.entries(ticketSummary)
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

  const attendeeList = order.registrations
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

  const receiptNumber = `REC-${order.id.slice(-8).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Receipt ${receiptNumber}</title>
  <style>
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
    .receipt-header {
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
    .receipt-title {
      text-align: right;
    }
    .receipt-title h1 {
      margin: 0;
      font-size: 32px;
      color: #0a1f5c;
    }
    .receipt-number {
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
      background: #dcfce7;
      color: #166534;
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
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save PDF</button>

  <div class="receipt-header">
    <div class="logo">
      Australian AI Safety Forum<br>
      <span style="font-size: 14px; font-weight: normal; color: #6b7280;">${eventConfig.year}</span><br>
      <span style="font-size: 12px; font-weight: normal; color: #6b7280;">Organised by ${eventConfig.organization.name}</span><br>
      <span style="font-size: 12px; font-weight: normal; color: #6b7280;">ABN: ${eventConfig.organization.abn}</span>
    </div>
    <div class="receipt-title">
      <h1>TAX RECEIPT</h1>
      <p class="receipt-number">${receiptNumber}</p>
      <span class="status-badge">PAID</span>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-section">
      <h3>Receipt For</h3>
      <p><strong>${escapeHtml(order.purchaserName)}</strong></p>
      <p>${escapeHtml(order.purchaserEmail)}</p>
    </div>
    <div class="detail-section" style="text-align: right;">
      <h3>Receipt Details</h3>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Payment Method:</strong> Credit Card</p>
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

  <div class="totals">
    ${
      order.discountAmount > 0
        ? `
    <div class="total-row">
      <span>Subtotal (before discount)</span>
      <span>$${(subtotal / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row" style="color: #059669;">
      <span>Discount${order.coupon ? ` (${order.coupon.code})` : ''}</span>
      <span>-$${(order.discountAmount / 100).toFixed(2)} AUD</span>
    </div>
    `
        : ''
    }
    <div class="total-row">
      <span>Subtotal (ex GST)</span>
      <span>$${(subtotalExGst / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row">
      <span>GST (10%)</span>
      <span>$${(gstAmount / 100).toFixed(2)} AUD</span>
    </div>
    <div class="total-row grand-total">
      <span>Total Paid (inc GST)</span>
      <span>$${(order.totalAmount / 100).toFixed(2)} AUD</span>
    </div>
  </div>

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

  <div class="footer">
    <p>Australian AI Safety Forum ${eventConfig.year}</p>
    <p>${eventConfig.datesLong} • ${eventConfig.venueLong}</p>
    <p>Questions? Contact us at ${eventConfig.organization.email}</p>
  </div>
</body>
</html>
  `;
}
