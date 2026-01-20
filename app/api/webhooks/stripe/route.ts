import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendConfirmationEmail } from '@/lib/brevo';
import Stripe from 'stripe';

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
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('✅ Checkout session completed:', session.id);

        // Update registration to paid
        const registration = await prisma.registration.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (registration) {
          await prisma.registration.update({
            where: { id: registration.id },
            data: {
              status: 'paid',
              stripePaymentId: session.payment_intent as string,
            },
          });

          console.log(`✅ Registration ${registration.id} marked as paid`);

          // Send confirmation email with calendar invite
          try {
            const receiptNumber = `AISF-${registration.id.slice(-8).toUpperCase()}`;
            const receiptDate = new Date(registration.createdAt).toLocaleDateString('en-AU', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            await sendConfirmationEmail({
              email: registration.email,
              name: registration.name,
              ticketType: registration.ticketType,
              organisation: registration.organisation,
              receiptNumber,
              receiptDate,
              amountPaid: registration.amountPaid,
              transactionId: session.payment_intent as string,
            });

            console.log(`✅ Confirmation email sent to ${registration.email}`);
          } catch (emailError) {
            console.error('❌ Error sending confirmation email:', emailError);
            // Don't fail the webhook if email fails
          }
        } else {
          console.warn(`⚠️  No registration found for session ${session.id}`);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('⏱️  Checkout session expired:', session.id);

        // Mark registration as cancelled
        const registration = await prisma.registration.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (registration) {
          await prisma.registration.update({
            where: { id: registration.id },
            data: { status: 'cancelled' },
          });

          console.log(`❌ Registration ${registration.id} marked as cancelled (session expired)`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`❌ Payment failed for ${paymentIntent.id}`);

        // Try to find registration by payment intent metadata
        if (paymentIntent.metadata?.registrationId) {
          await prisma.registration.update({
            where: { id: paymentIntent.metadata.registrationId },
            data: { status: 'failed' },
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
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
