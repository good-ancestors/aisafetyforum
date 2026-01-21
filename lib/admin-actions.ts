'use server';

import { prisma } from './prisma';
import { sendConfirmationEmail } from './brevo';
import { requireAdmin } from './auth/admin';
import { revalidatePath } from 'next/cache';

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

// ============================================
// Orders Admin
// ============================================

/**
 * Get all orders with optional filtering
 */
export async function getAllOrders(filters?: {
  status?: 'pending' | 'paid' | 'cancelled' | 'failed';
  paymentMethod?: 'card' | 'invoice';
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where: Record<string, unknown> = {};
  if (filters?.status) where.paymentStatus = filters.status;
  if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;

  return prisma.order.findMany({
    where,
    include: {
      registrations: {
        include: { profile: true },
      },
      coupon: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const [total, pending, paid, cancelled, cardOrders, invoiceOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: 'pending' } }),
    prisma.order.count({ where: { paymentStatus: 'paid' } }),
    prisma.order.count({ where: { paymentStatus: 'cancelled' } }),
    prisma.order.aggregate({
      where: { paymentMethod: 'card', paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { paymentMethod: 'invoice', paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    total,
    pending,
    paid,
    cancelled,
    cardRevenue: cardOrders._sum.totalAmount || 0,
    invoiceRevenue: invoiceOrders._sum.totalAmount || 0,
  };
}

// ============================================
// Registrations/Tickets Admin
// ============================================

/**
 * Get all registrations with optional filtering
 */
export async function getAllRegistrations(filters?: {
  status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;

  return prisma.registration.findMany({
    where,
    include: {
      profile: true,
      order: true,
      coupon: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get registration statistics
 */
export async function getRegistrationStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const [total, pending, paid, cancelled, refunded, ticketTypes] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'pending' } }),
    prisma.registration.count({ where: { status: 'paid' } }),
    prisma.registration.count({ where: { status: 'cancelled' } }),
    prisma.registration.count({ where: { status: 'refunded' } }),
    prisma.registration.groupBy({
      by: ['ticketType'],
      where: { status: 'paid' },
      _count: true,
    }),
  ]);

  return {
    total,
    pending,
    paid,
    cancelled,
    refunded,
    ticketTypes: ticketTypes.map((t) => ({
      type: t.ticketType,
      count: t._count,
    })),
  };
}

// ============================================
// Applications Admin
// ============================================

/**
 * Get all speaker proposals
 */
export async function getAllSpeakerProposals(filters?: {
  status?: 'pending' | 'accepted' | 'rejected';
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;

  return prisma.speakerProposal.findMany({
    where,
    include: { profile: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all scholarship/funding applications
 */
export async function getAllScholarshipApplications(filters?: {
  status?: 'pending' | 'approved' | 'rejected';
}) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;

  return prisma.fundingApplication.findMany({
    where,
    include: { profile: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get application statistics
 */
export async function getApplicationStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const [
    speakerTotal,
    speakerPending,
    speakerAccepted,
    speakerRejected,
    scholarshipTotal,
    scholarshipPending,
    scholarshipApproved,
    scholarshipRejected,
  ] = await Promise.all([
    prisma.speakerProposal.count(),
    prisma.speakerProposal.count({ where: { status: 'pending' } }),
    prisma.speakerProposal.count({ where: { status: 'accepted' } }),
    prisma.speakerProposal.count({ where: { status: 'rejected' } }),
    prisma.fundingApplication.count(),
    prisma.fundingApplication.count({ where: { status: 'pending' } }),
    prisma.fundingApplication.count({ where: { status: 'approved' } }),
    prisma.fundingApplication.count({ where: { status: 'rejected' } }),
  ]);

  return {
    speaker: {
      total: speakerTotal,
      pending: speakerPending,
      accepted: speakerAccepted,
      rejected: speakerRejected,
    },
    scholarship: {
      total: scholarshipTotal,
      pending: scholarshipPending,
      approved: scholarshipApproved,
      rejected: scholarshipRejected,
    },
  };
}

/**
 * Update speaker proposal status
 */
export async function updateSpeakerProposalStatus(
  id: string,
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.speakerProposal.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin/applications');
    return { success: true };
  } catch (error) {
    console.error('Error updating speaker proposal:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Update scholarship application status
 */
export async function updateScholarshipStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.fundingApplication.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin/applications');
    return { success: true };
  } catch (error) {
    console.error('Error updating scholarship application:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

// ============================================
// Profiles/Users Admin
// ============================================

/**
 * Get all profiles
 */
export async function getAllProfiles(filters?: { isAdmin?: boolean }) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where: Record<string, unknown> = {};
  if (filters?.isAdmin !== undefined) where.isAdmin = filters.isAdmin;

  return prisma.profile.findMany({
    where,
    include: {
      registrations: { where: { status: 'paid' } },
      speakerProposals: true,
      fundingApplications: true,
      _count: {
        select: {
          registrations: true,
          speakerProposals: true,
          fundingApplications: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get profile statistics
 */
export async function getProfileStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const [total, admins, withTickets, withApplications] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { isAdmin: true } }),
    prisma.profile.count({
      where: { registrations: { some: { status: 'paid' } } },
    }),
    prisma.profile.count({
      where: {
        OR: [
          { speakerProposals: { some: {} } },
          { fundingApplications: { some: {} } },
        ],
      },
    }),
  ]);

  return { total, admins, withTickets, withApplications };
}

/**
 * Toggle admin status for a profile
 */
export async function toggleAdminStatus(
  profileId: string
): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) return { success: false, error: 'Profile not found' };

    const updated = await prisma.profile.update({
      where: { id: profileId },
      data: { isAdmin: !profile.isAdmin },
    });

    revalidatePath('/admin/profiles');
    return { success: true, isAdmin: updated.isAdmin };
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return { success: false, error: 'Failed to update admin status' };
  }
}

// ============================================
// Discount Codes Admin
// ============================================

/**
 * Get all discount codes
 */
export async function getAllDiscountCodes() {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  return prisma.discountCode.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          registrations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Create a new discount code
 */
export async function createDiscountCode(data: {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  maxUses?: number;
  validFor?: string[];
  allowedEmails?: string[];
  validFrom?: Date;
  validUntil?: Date;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses || null,
        validFor: data.validFor || [],
        allowedEmails: data.allowedEmails || [],
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        active: true,
      },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error creating discount code:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'A discount code with this name already exists' };
    }
    return { success: false, error: 'Failed to create discount code' };
  }
}

/**
 * Update an existing discount code
 */
export async function updateDiscountCode(
  id: string,
  data: {
    code?: string;
    description?: string;
    type?: 'percentage' | 'fixed' | 'free';
    value?: number;
    maxUses?: number | null;
    validFor?: string[];
    allowedEmails?: string[];
    validFrom?: Date | null;
    validUntil?: Date | null;
    active?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) return { success: false, error: 'Discount code not found' };

    await prisma.discountCode.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code.toUpperCase() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.validFor !== undefined && { validFor: data.validFor }),
        ...(data.allowedEmails !== undefined && { allowedEmails: data.allowedEmails }),
        ...(data.validFrom !== undefined && { validFrom: data.validFrom }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error updating discount code:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'A discount code with this name already exists' };
    }
    return { success: false, error: 'Failed to update discount code' };
  }
}

/**
 * Toggle discount code active status
 */
export async function toggleDiscountCodeStatus(
  id: string
): Promise<{ success: boolean; error?: string; active?: boolean }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const code = await prisma.discountCode.findUnique({ where: { id } });
    if (!code) return { success: false, error: 'Discount code not found' };

    const updated = await prisma.discountCode.update({
      where: { id },
      data: { active: !code.active },
    });

    revalidatePath('/admin/discounts');
    return { success: true, active: updated.active };
  } catch (error) {
    console.error('Error toggling discount code:', error);
    return { success: false, error: 'Failed to update discount code' };
  }
}

/**
 * Delete a discount code
 */
export async function deleteDiscountCode(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    // Check if code has been used
    const code = await prisma.discountCode.findUnique({
      where: { id },
      include: { _count: { select: { orders: true, registrations: true } } },
    });

    if (!code) return { success: false, error: 'Discount code not found' };

    if (code._count.orders > 0 || code._count.registrations > 0) {
      return {
        success: false,
        error: 'Cannot delete a discount code that has been used. Deactivate it instead.',
      };
    }

    await prisma.discountCode.delete({ where: { id } });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return { success: false, error: 'Failed to delete discount code' };
  }
}

// ============================================
// Order/Registration Admin Actions (Cancel/Refund)
// ============================================

/**
 * Admin: Cancel an order with optional refund
 */
export async function adminCancelOrder(
  orderId: string,
  options: { issueRefund?: boolean } = {}
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { registrations: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentStatus === 'cancelled') {
      return { success: false, error: 'Order is already cancelled' };
    }

    let refundId: string | undefined;

    // Process refund for card payments
    if (options.issueRefund && order.paymentMethod === 'card' && order.stripePaymentId && order.totalAmount > 0) {
      const { stripe } = await import('./stripe');
      if (!stripe) {
        return { success: false, error: 'Stripe is not configured' };
      }

      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentId,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return { success: false, error: 'Failed to process Stripe refund' };
      }
    }

    const newRegStatus = options.issueRefund && refundId ? 'refunded' : 'cancelled';

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'cancelled' },
      }),
      ...order.registrations.map((reg) =>
        prisma.registration.update({
          where: { id: reg.id },
          data: { status: newRegStatus },
        })
      ),
    ]);

    revalidatePath('/admin/orders');
    revalidatePath('/admin/registrations');
    return { success: true, refundId };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}

/**
 * Admin: Cancel a single registration with optional refund
 */
export async function adminCancelRegistration(
  registrationId: string,
  options: { issueRefund?: boolean } = {}
): Promise<{ success: boolean; error?: string; refundId?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { order: { include: { registrations: true } } },
    });

    if (!registration) {
      return { success: false, error: 'Registration not found' };
    }

    if (registration.status === 'cancelled' || registration.status === 'refunded') {
      return { success: false, error: 'Ticket is already cancelled' };
    }

    let refundId: string | undefined;

    // Process partial refund for card payments
    if (
      options.issueRefund &&
      registration.order?.paymentMethod === 'card' &&
      registration.order?.stripePaymentId &&
      registration.amountPaid > 0
    ) {
      const { stripe } = await import('./stripe');
      if (!stripe) {
        return { success: false, error: 'Stripe is not configured' };
      }

      try {
        const refundAmount = registration.ticketPrice || registration.amountPaid;
        const refund = await stripe.refunds.create({
          payment_intent: registration.order.stripePaymentId,
          amount: refundAmount,
        });
        refundId = refund.id;
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return { success: false, error: 'Failed to process Stripe refund' };
      }
    }

    const newStatus = options.issueRefund && refundId ? 'refunded' : 'cancelled';

    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: newStatus },
    });

    // Check if all registrations are cancelled
    if (registration.order) {
      const remainingActive = registration.order.registrations.filter(
        (r) => r.id !== registrationId && r.status !== 'cancelled' && r.status !== 'refunded'
      );

      if (remainingActive.length === 0) {
        await prisma.order.update({
          where: { id: registration.order.id },
          data: { paymentStatus: 'cancelled' },
        });
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/registrations');
    return { success: true, refundId };
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return { success: false, error: 'Failed to cancel ticket' };
  }
}

/**
 * Admin: Delete a profile
 * Only profiles without active orders/registrations can be deleted
 */
export async function deleteProfile(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        registrations: { where: { status: { in: ['paid', 'pending'] } } },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!profile) return { success: false, error: 'Profile not found' };

    // Prevent deletion of profiles with active registrations
    if (profile.registrations.length > 0) {
      return {
        success: false,
        error: 'Cannot delete profile with active tickets. Cancel tickets first.',
      };
    }

    // Delete all related data in order
    await prisma.$transaction([
      prisma.fundingApplication.deleteMany({ where: { profileId } }),
      prisma.speakerProposal.deleteMany({ where: { profileId } }),
      prisma.registration.deleteMany({ where: { profileId } }),
      prisma.profile.delete({ where: { id: profileId } }),
    ]);

    revalidatePath('/admin/profiles');
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { success: false, error: 'Failed to delete profile' };
  }
}

// ============================================
// Free Ticket Emails Admin (Auto-triggered complimentary tickets)
// ============================================

/**
 * Get all free ticket emails
 */
export async function getAllFreeTicketEmails(activeOnly = false) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const where = activeOnly ? { active: true } : {};
  return prisma.freeTicketEmail.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Add a free ticket email
 */
export async function addFreeTicketEmail(
  email: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.freeTicketEmail.create({
      data: {
        email: email.toLowerCase().trim(),
        reason,
        active: true,
      },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error adding free ticket email:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'This email is already in the free ticket list' };
    }
    return { success: false, error: 'Failed to add email' };
  }
}

/**
 * Add multiple free ticket emails at once
 */
export async function addBulkFreeTicketEmails(
  emails: string[],
  reason: string
): Promise<{ success: boolean; added: number; failed: number; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, added: 0, failed: 0, error: 'Unauthorized' };

    const results = await Promise.allSettled(
      emails.map((email) =>
        prisma.freeTicketEmail.create({
          data: {
            email: email.toLowerCase().trim(),
            reason,
            active: true,
          },
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    revalidatePath('/admin/discounts');
    return { success: true, added: successful, failed };
  } catch (error) {
    console.error('Error adding bulk free ticket emails:', error);
    return { success: false, added: 0, failed: emails.length, error: 'Failed to add emails' };
  }
}

/**
 * Toggle free ticket email active status
 */
export async function toggleFreeTicketEmailStatus(
  id: string
): Promise<{ success: boolean; error?: string; active?: boolean }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const email = await prisma.freeTicketEmail.findUnique({ where: { id } });
    if (!email) return { success: false, error: 'Email not found' };

    const updated = await prisma.freeTicketEmail.update({
      where: { id },
      data: { active: !email.active },
    });

    revalidatePath('/admin/discounts');
    return { success: true, active: updated.active };
  } catch (error) {
    console.error('Error toggling free ticket email:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Delete a free ticket email
 */
export async function deleteFreeTicketEmail(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.freeTicketEmail.delete({ where: { id } });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting free ticket email:', error);
    return { success: false, error: 'Failed to delete email' };
  }
}

/**
 * Update free ticket email reason
 */
export async function updateFreeTicketEmail(
  id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { success: false, error: 'Unauthorized' };

    await prisma.freeTicketEmail.update({
      where: { id },
      data: { reason },
    });

    revalidatePath('/admin/discounts');
    return { success: true };
  } catch (error) {
    console.error('Error updating free ticket email:', error);
    return { success: false, error: 'Failed to update email' };
  }
}
