'use server';

import { sendReceiptEmail, sendTicketConfirmationEmail } from './brevo';
import { prisma } from './prisma';
import { isProduction, redactEmail } from './security';

/**
 * Complete an order after payment is confirmed.
 * This is the single source of truth for order completion logic.
 *
 * Handles:
 * 1. Marking order and registrations as paid
 * 2. Sending receipt email to purchaser
 * 3. Sending ticket confirmation to each attendee
 *
 * Called from:
 * - Stripe webhook (checkout.session.completed)
 * - Free ticket flows (when totalAmount === 0)
 * - Admin marking invoice as paid (bank transfer received)
 */
export async function completeOrder(
  orderId: string,
  options?: {
    paymentIntentId?: string | null;
    transactionId?: string | null;
    discountDescription?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch the order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registrations: true,
        coupon: true,
      },
    });

    if (!order) {
      console.error(`❌ completeOrder: Order not found: ${orderId}`);
      return { success: false, error: 'Order not found' };
    }

    // Check if already completed
    if (order.paymentStatus === 'paid') {
      console.log(`ℹ️  completeOrder: Order ${orderId} already marked as paid`);
      return { success: true };
    }

    const paymentId = options?.paymentIntentId || options?.transactionId || null;

    // Mark order and all registrations as paid in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          stripePaymentId: paymentId,
        },
      }),
      ...order.registrations.map((reg) =>
        prisma.registration.update({
          where: { id: reg.id },
          data: {
            status: 'paid',
            stripePaymentId: paymentId,
          },
        })
      ),
    ]);

    console.log(
      `✅ completeOrder: Order ${order.id} marked as paid with ${order.registrations.length} registration(s)`
    );

    // Format order date
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Calculate subtotal from registrations
    const subtotal = order.registrations.reduce((sum, r) => sum + (r.ticketPrice || 0), 0);
    const discountAmount = order.discountAmount || 0;
    const totalAmount = order.totalAmount;

    // Determine discount description
    const discountDesc =
      options?.discountDescription ||
      order.coupon?.code ||
      (totalAmount === 0 ? 'Complimentary tickets' : undefined);

    // 1. Send RECEIPT to the purchaser
    try {
      await sendReceiptEmail({
        purchaserEmail: order.purchaserEmail,
        purchaserName: order.purchaserName,
        orderNumber: `AISF-${order.id.slice(-8).toUpperCase()}`,
        orderDate,
        transactionId: paymentId,
        attendees: order.registrations.map((r) => ({
          name: r.name,
          email: r.email,
          ticketType: r.ticketType,
          amount: r.ticketPrice || r.amountPaid,
        })),
        subtotal,
        discountAmount,
        discountDescription: discountDesc,
        totalAmount,
      });

      console.log(
        `✅ completeOrder: Receipt email sent to purchaser ${
          isProduction() ? redactEmail(order.purchaserEmail) : order.purchaserEmail
        }`
      );
    } catch (emailError) {
      console.error(`❌ completeOrder: Error sending receipt email:`, emailError);
      // Continue - don't fail the order completion if email fails
    }

    // 2. Send TICKET CONFIRMATION to each attendee
    for (const reg of order.registrations) {
      try {
        await sendTicketConfirmationEmail({
          email: reg.email,
          name: reg.name,
          ticketType: reg.ticketType,
          purchaserEmail: order.purchaserEmail,
          purchaserName: order.purchaserName,
        });

        console.log(
          `✅ completeOrder: Ticket confirmation email sent to ${
            isProduction() ? redactEmail(reg.email) : reg.email
          }`
        );
      } catch (emailError) {
        console.error(
          `❌ completeOrder: Error sending ticket confirmation email to ${
            isProduction() ? redactEmail(reg.email) : reg.email
          }:`,
          emailError
        );
        // Continue - don't fail for individual email errors
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ completeOrder: Failed to complete order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error completing order',
    };
  }
}

