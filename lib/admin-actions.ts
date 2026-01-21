'use server';

import { prisma } from './prisma';
import { sendConfirmationEmail } from './brevo';

/**
 * Get all orders with invoice payment method
 */
export async function getInvoiceOrders(status?: 'pending' | 'paid' | 'all') {
  const where = {
    paymentMethod: 'invoice',
    ...(status && status !== 'all' ? { paymentStatus: status } : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      registrations: {
        include: {
          profile: true,
        },
      },
      coupon: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

/**
 * Mark an invoice order as paid and send confirmation emails to all attendees
 */
export async function markInvoiceAsPaid(orderId: string) {
  try {
    // Get the order with registrations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registrations: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentStatus === 'paid') {
      return { success: false, error: 'Order is already marked as paid' };
    }

    // Update order and registrations in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid' },
      }),
      ...order.registrations.map((reg) =>
        prisma.registration.update({
          where: { id: reg.id },
          data: { status: 'paid' },
        })
      ),
    ]);

    // Send confirmation emails to each attendee
    const emailPromises = order.registrations.map((reg) =>
      sendConfirmationEmail({
        email: reg.email,
        name: reg.name,
        ticketType: reg.ticketType,
        organisation: reg.profile?.organisation,
        receiptNumber: order.invoiceNumber || `AISF-${order.id.slice(-8).toUpperCase()}`,
        receiptDate: new Date().toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        amountPaid: (reg.ticketPrice || 0) - (reg.discountAmount || 0),
        transactionId: `BANK-${order.invoiceNumber || order.id.slice(-8).toUpperCase()}`,
        purchaserEmail: order.purchaserEmail,
        purchaserName: order.purchaserName,
      }).catch((error) => {
        console.error(`Failed to send confirmation to ${reg.email}:`, error);
        return null;
      })
    );

    await Promise.all(emailPromises);

    return { success: true };
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as paid',
    };
  }
}

/**
 * Resend invoice email to purchaser
 */
export async function resendInvoiceEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registrations: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (!order.invoiceNumber) {
      return { success: false, error: 'Order does not have an invoice number' };
    }

    // Import PDF generation dynamically
    const { generateInvoicePDF, calculateGST } = await import('./invoice-pdf');
    const { sendInvoiceEmail } = await import('./brevo');
    const { ticketTiers, isEarlyBirdActive } = await import('./stripe-config');

    const earlyBird = isEarlyBirdActive();

    // Build line items from registrations
    const ticketCounts: Record<string, { name: string; count: number; price: number }> = {};
    for (const reg of order.registrations) {
      const tier = ticketTiers.find((t) => reg.ticketType.includes(t.name));
      if (tier) {
        const key = tier.id;
        const price = earlyBird ? tier.earlyBirdPrice : tier.price;
        if (!ticketCounts[key]) {
          ticketCounts[key] = { name: tier.name, count: 0, price };
        }
        ticketCounts[key].count++;
      }
    }

    const lineItems = Object.values(ticketCounts).map(({ name, count, price }) => ({
      description: earlyBird
        ? `${name} Ticket (Early Bird) - AI Safety Forum 2026`
        : `${name} Ticket - AI Safety Forum 2026`,
      quantity: count,
      unitPrice: price,
      amount: price * count,
    }));

    const attendees = order.registrations.map((reg) => ({
      name: reg.name,
      email: reg.email,
      ticketType: reg.ticketType,
    }));

    const invoiceDate = order.createdAt;
    const dueDate = order.invoiceDueDate || new Date(invoiceDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: order.invoiceNumber,
      invoiceDate,
      dueDate,
      purchaser: {
        name: order.purchaserName,
        email: order.purchaserEmail,
        organisation: order.orgName || undefined,
        abn: order.orgABN || undefined,
      },
      poNumber: order.poNumber || undefined,
      lineItems,
      subtotal: order.totalAmount + order.discountAmount,
      gstAmount: calculateGST(order.totalAmount),
      discountAmount: order.discountAmount > 0 ? order.discountAmount : undefined,
      total: order.totalAmount,
      attendees,
    });

    // Send email
    await sendInvoiceEmail({
      email: order.purchaserEmail,
      name: order.purchaserName,
      organisation: order.orgName,
      invoiceNumber: order.invoiceNumber,
      invoiceDate: invoiceDate.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      dueDate: dueDate.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      totalAmount: order.totalAmount,
      attendeeCount: order.registrations.length,
      poNumber: order.poNumber,
      pdfBuffer,
    });

    return { success: true };
  } catch (error) {
    console.error('Error resending invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend invoice',
    };
  }
}
