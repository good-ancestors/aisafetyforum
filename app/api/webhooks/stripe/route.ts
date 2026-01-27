import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { completeOrder } from '@/lib/order-completion';
import { prisma } from '@/lib/prisma';
import { isProduction } from '@/lib/security';
import { requireStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = requireStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Webhook signature verification failed:', message);
    // Don't expose internal error details in production
    return NextResponse.json(
      { error: isProduction() ? 'Webhook verification failed' : `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('✅ Checkout session completed:', session.id);

        // Find order by session ID
        const order = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (order) {
          const result = await completeOrder(order.id, {
            paymentIntentId: session.payment_intent as string,
          });

          if (!result.success) {
            console.error(`❌ Failed to complete order ${order.id}:`, result.error);
          }
        } else {
          console.warn(`⚠️  No order found for session ${session.id}`);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('⏱️  Checkout session expired:', session.id);

        const order = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
          include: { registrations: true },
        });

        if (order) {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'cancelled' },
            }),
            ...order.registrations.map((reg) =>
              prisma.registration.update({
                where: { id: reg.id },
                data: { status: 'cancelled' },
              })
            ),
          ]);
          console.log(
            `❌ Order ${order.id} and ${order.registrations.length} registrations cancelled (session expired)`
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed for ${paymentIntent.id}`);

        // Update order if present in metadata
        if (paymentIntent.metadata?.orderId) {
          await prisma.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: { paymentStatus: 'failed' },
          });
        }
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
