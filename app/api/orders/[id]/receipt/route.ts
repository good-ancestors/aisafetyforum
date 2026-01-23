import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIdentifier, rateLimitPresets } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`receipt-url:${clientId}`, rateLimitPresets.standard);
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

  // Check if order is paid
  if (order.paymentStatus !== 'paid') {
    return NextResponse.json({ error: 'Order not paid' }, { status: 400 });
  }

  try {
    // For card payments, get receipt from Payment Intent
    if (order.stripePaymentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentId, {
        expand: ['latest_charge'],
      });

      const charge = paymentIntent.latest_charge as Stripe.Charge;
      if (charge?.receipt_url) {
        return NextResponse.json({ receiptUrl: charge.receipt_url });
      }
    }

    // For invoice payments, get invoice PDF
    if (order.stripeInvoiceId) {
      const invoice = await stripe.invoices.retrieve(order.stripeInvoiceId);
      if (invoice.invoice_pdf) {
        return NextResponse.json({ receiptUrl: invoice.invoice_pdf });
      }
    }

    return NextResponse.json({ error: 'No receipt available' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 });
  }
}
