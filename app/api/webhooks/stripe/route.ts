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

        // First try to find an Order by session ID (multi-ticket orders)
        const order = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
          include: { registrations: true },
        });

        if (order) {
          // Multi-ticket order: update order and all registrations
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'paid',
                stripePaymentId: session.payment_intent as string,
              },
            }),
            ...order.registrations.map((reg) =>
              prisma.registration.update({
                where: { id: reg.id },
                data: {
                  status: 'paid',
                  stripePaymentId: session.payment_intent as string,
                },
              })
            ),
          ]);

          console.log(`✅ Order ${order.id} marked as paid with ${order.registrations.length} registrations`);

          // Send confirmation email to each attendee
          for (const reg of order.registrations) {
            try {
              const receiptNumber = `AISF-${reg.id.slice(-8).toUpperCase()}`;
              const receiptDate = new Date(reg.createdAt).toLocaleDateString('en-AU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              await sendConfirmationEmail({
                email: reg.email,
                name: reg.name,
                ticketType: reg.ticketType,
                organisation: reg.organisation,
                receiptNumber,
                receiptDate,
                amountPaid: reg.ticketPrice || reg.amountPaid,
                transactionId: session.payment_intent as string,
                // Include purchaser info for group orders
                purchaserEmail: order.purchaserEmail,
                purchaserName: order.purchaserName,
              });

              console.log(`✅ Confirmation email sent to ${reg.email}`);
            } catch (emailError) {
              console.error(`❌ Error sending confirmation email to ${reg.email}:`, emailError);
            }
          }
        } else {
          // Fallback: try to find single registration by session ID (legacy single-ticket)
          const registration = await prisma.registration.findUnique({
            where: { stripeSessionId: session.id },
            include: { order: true },
          });

          if (registration) {
            await prisma.$transaction([
              prisma.registration.update({
                where: { id: registration.id },
                data: {
                  status: 'paid',
                  stripePaymentId: session.payment_intent as string,
                },
              }),
              ...(registration.orderId
                ? [
                    prisma.order.update({
                      where: { id: registration.orderId },
                      data: {
                        paymentStatus: 'paid',
                        stripePaymentId: session.payment_intent as string,
                      },
                    }),
                  ]
                : []),
            ]);

            console.log(`✅ Registration ${registration.id} marked as paid`);

            // Send confirmation email
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
            }
          } else {
            console.warn(`⚠️  No order or registration found for session ${session.id}`);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('⏱️  Checkout session expired:', session.id);

        // First try to find an Order by session ID (multi-ticket orders)
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
          console.log(`❌ Order ${order.id} and ${order.registrations.length} registrations cancelled (session expired)`);
        } else {
          // Fallback: try single registration
          const registration = await prisma.registration.findUnique({
            where: { stripeSessionId: session.id },
          });

          if (registration) {
            await prisma.$transaction([
              prisma.registration.update({
                where: { id: registration.id },
                data: { status: 'cancelled' },
              }),
              ...(registration.orderId
                ? [
                    prisma.order.update({
                      where: { id: registration.orderId },
                      data: { paymentStatus: 'cancelled' },
                    }),
                  ]
                : []),
            ]);
            console.log(`❌ Registration ${registration.id} marked as cancelled (session expired)`);
          }
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

        // Also update order if present in metadata
        if (paymentIntent.metadata?.orderId) {
          await prisma.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: { paymentStatus: 'failed' },
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        console.log('✅ Invoice paid:', invoice.id);

        // Get payment intent ID from charge or metadata
        // Invoice payment_intent may not be directly accessible in all API versions
        const invoiceData = invoice as Stripe.Invoice & { payment_intent?: string | { id: string } | null };
        const paymentIntentId = invoiceData.payment_intent
          ? (typeof invoiceData.payment_intent === 'string'
              ? invoiceData.payment_intent
              : invoiceData.payment_intent?.id)
          : null;

        // Find order by Stripe invoice ID
        const order = await prisma.order.findUnique({
          where: { stripeInvoiceId: invoice.id },
          include: { registrations: true },
        });

        if (order) {
          // Update order and all registrations to paid
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'paid',
                stripePaymentId: paymentIntentId,
              },
            }),
            ...order.registrations.map((reg) =>
              prisma.registration.update({
                where: { id: reg.id },
                data: {
                  status: 'paid',
                  stripePaymentId: paymentIntentId,
                },
              })
            ),
          ]);

          console.log(`✅ Invoice order ${order.id} marked as paid with ${order.registrations.length} registrations`);

          // Send confirmation email to each attendee
          for (const reg of order.registrations) {
            try {
              const receiptNumber = `AISF-${reg.id.slice(-8).toUpperCase()}`;
              const receiptDate = new Date().toLocaleDateString('en-AU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              await sendConfirmationEmail({
                email: reg.email,
                name: reg.name,
                ticketType: reg.ticketType,
                organisation: reg.organisation,
                receiptNumber,
                receiptDate,
                amountPaid: reg.ticketPrice || reg.amountPaid,
                transactionId: paymentIntentId,
                // Include purchaser info for group orders
                purchaserEmail: order.purchaserEmail,
                purchaserName: order.purchaserName,
              });

              console.log(`✅ Confirmation email sent to ${reg.email} (invoice payment)`);
            } catch (emailError) {
              console.error(`❌ Error sending confirmation email to ${reg.email}:`, emailError);
            }
          }
        } else {
          console.warn(`⚠️  No order found for invoice ${invoice.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        console.error('❌ Invoice payment failed:', invoice.id);

        // Find order by Stripe invoice ID
        const order = await prisma.order.findUnique({
          where: { stripeInvoiceId: invoice.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'failed' },
          });
          console.log(`❌ Order ${order.id} marked as failed (invoice payment failed)`);
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
