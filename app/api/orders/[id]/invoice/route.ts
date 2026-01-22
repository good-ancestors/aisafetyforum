import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentifier, rateLimitPresets } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`invoice-url:${clientId}`, rateLimitPresets.standard);
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the order and verify ownership
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Check if user is the purchaser
  if (order.purchaserEmail.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check if this is an invoice order
  if (order.paymentMethod !== 'invoice') {
    return NextResponse.json({ error: 'This is not an invoice order' }, { status: 400 });
  }

  // For now, generate a simple invoice URL pointing to a PDF generation endpoint
  // In production, you might want to:
  // 1. Generate a PDF on-the-fly
  // 2. Store pre-generated PDFs in cloud storage
  // 3. Use a third-party invoicing service

  // Return a URL to our invoice PDF generation endpoint
  const invoiceUrl = `/api/orders/${id}/invoice/pdf`;

  return NextResponse.json({ invoiceUrl });
}
