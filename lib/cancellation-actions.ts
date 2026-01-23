'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export interface CancelOrderOptions {
  issueRefund?: boolean;
}

export interface CancelRegistrationOptions {
  issueRefund?: boolean;
}

/**
 * Cancel an entire order with optional refund.
 * For card payments, issues a full Stripe refund.
 * For invoice payments, marks as cancelled (manual refund required).
 */
export async function cancelOrder(
  orderId: string,
  options: CancelOrderOptions = {}
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registrations: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Verify ownership (purchaser email must match)
    if (order.purchaserEmail.toLowerCase() !== user.email.toLowerCase()) {
      return { success: false, error: 'Not authorized to cancel this order' };
    }

    // Check if already cancelled
    if (order.paymentStatus === 'cancelled') {
      return { success: false, error: 'Order is already cancelled' };
    }

    let refundId: string | undefined;

    // Process refund for card payments if requested
    if (options.issueRefund && order.paymentMethod === 'card' && order.stripePaymentId && order.totalAmount > 0) {
      if (!stripe) {
        return { success: false, error: 'Stripe is not configured. Cannot process refund.' };
      }

      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentId,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return { success: false, error: 'Failed to process Stripe refund. Please contact support.' };
      }
    }

    // Determine new status based on whether refund was issued
    const newRegistrationStatus = options.issueRefund && refundId ? 'refunded' : 'cancelled';

    // Update order and all registrations in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'cancelled' },
      }),
      ...order.registrations.map((reg) =>
        prisma.registration.update({
          where: { id: reg.id },
          data: { status: newRegistrationStatus },
        })
      ),
    ]);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/tickets');

    return { success: true, refundId };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      error: 'Failed to cancel order. Please try again.',
    };
  }
}

/**
 * Cancel a single registration (ticket) with optional partial refund.
 * For card payments, issues a partial Stripe refund for the ticket amount.
 */
export async function cancelRegistration(
  registrationId: string,
  options: CancelRegistrationOptions = {}
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the registration with order
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        order: {
          include: {
            registrations: true,
          },
        },
        profile: true,
      },
    });

    if (!registration) {
      return { success: false, error: 'Registration not found' };
    }

    // Verify ownership (purchaser email or attendee email must match)
    const userEmail = user.email.toLowerCase();
    const isPurchaser = registration.order?.purchaserEmail.toLowerCase() === userEmail;
    const isAttendee = registration.email.toLowerCase() === userEmail;
    const isProfileOwner = registration.profile?.email.toLowerCase() === userEmail;

    if (!isPurchaser && !isAttendee && !isProfileOwner) {
      return { success: false, error: 'Not authorized to cancel this ticket' };
    }

    // Check if already cancelled
    if (registration.status === 'cancelled' || registration.status === 'refunded') {
      return { success: false, error: 'Ticket is already cancelled' };
    }

    let refundId: string | undefined;

    // Process partial refund for card payments if requested
    if (
      options.issueRefund &&
      registration.order?.paymentMethod === 'card' &&
      registration.order?.stripePaymentId &&
      registration.amountPaid > 0
    ) {
      if (!stripe) {
        return { success: false, error: 'Stripe is not configured. Cannot process refund.' };
      }

      try {
        // Calculate refund amount (the amount this ticket contributed)
        const refundAmount = registration.ticketPrice || registration.amountPaid;

        const refund = await stripe.refunds.create({
          payment_intent: registration.order.stripePaymentId,
          amount: refundAmount,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe partial refund error:', stripeError);
        return { success: false, error: 'Failed to process Stripe refund. Please contact support.' };
      }
    }

    // Determine new status
    const newStatus = options.issueRefund && refundId ? 'refunded' : 'cancelled';

    // Update the registration
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: newStatus },
    });

    // Check if all registrations in the order are now cancelled
    if (registration.order) {
      const remainingActive = registration.order.registrations.filter(
        (r) => r.id !== registrationId && r.status !== 'cancelled' && r.status !== 'refunded'
      );

      if (remainingActive.length === 0) {
        // All tickets cancelled, cancel the order too
        await prisma.order.update({
          where: { id: registration.order.id },
          data: { paymentStatus: 'cancelled' },
        });
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/tickets');

    return { success: true, refundId };
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return {
      success: false,
      error: 'Failed to cancel ticket. Please try again.',
    };
  }
}

/**
 * Get cancellation/refund info for an order.
 * Helps UI show appropriate options.
 */
export async function getOrderCancellationInfo(orderId: string): Promise<{
  canCancel: boolean;
  canRefund: boolean;
  refundMessage?: string;
  totalAmount: number;
  paymentMethod: string;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return {
      canCancel: false,
      canRefund: false,
      totalAmount: 0,
      paymentMethod: 'unknown',
    };
  }

  const isPaid = order.paymentStatus === 'paid';
  const isCard = order.paymentMethod === 'card';
  const hasStripePayment = !!order.stripePaymentId;

  let refundMessage: string | undefined;
  if (!isPaid) {
    refundMessage = 'This order has not been paid yet.';
  } else if (order.paymentMethod === 'invoice') {
    refundMessage = 'Invoice payments require a manual refund. Please contact us for refund processing.';
  } else if (!hasStripePayment) {
    refundMessage = 'No payment record found for automatic refund.';
  }

  return {
    canCancel: order.paymentStatus !== 'cancelled',
    canRefund: isPaid && isCard && hasStripePayment && order.totalAmount > 0,
    refundMessage,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
  };
}

/**
 * Get cancellation/refund info for a single registration.
 */
export async function getRegistrationCancellationInfo(registrationId: string): Promise<{
  canCancel: boolean;
  canRefund: boolean;
  refundMessage?: string;
  ticketAmount: number;
  paymentMethod: string;
}> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { order: true },
  });

  if (!registration) {
    return {
      canCancel: false,
      canRefund: false,
      ticketAmount: 0,
      paymentMethod: 'unknown',
    };
  }

  const isPaid = registration.status === 'paid';
  const isCard = registration.order?.paymentMethod === 'card';
  const hasStripePayment = !!registration.order?.stripePaymentId;
  const ticketAmount = registration.ticketPrice || registration.amountPaid;

  let refundMessage: string | undefined;
  if (!isPaid) {
    refundMessage = 'This ticket has not been paid yet.';
  } else if (registration.order?.paymentMethod === 'invoice') {
    refundMessage = 'Invoice payments require a manual refund. Please contact us for refund processing.';
  } else if (!hasStripePayment) {
    refundMessage = 'No payment record found for automatic refund.';
  }

  return {
    canCancel: registration.status !== 'cancelled' && registration.status !== 'refunded',
    canRefund: isPaid && isCard && hasStripePayment && ticketAmount > 0,
    refundMessage,
    ticketAmount,
    paymentMethod: registration.order?.paymentMethod || 'unknown',
  };
}
