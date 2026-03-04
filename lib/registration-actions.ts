'use server';

import { headers } from 'next/headers';
import { siteConfig } from './config';
import { validateCoupon, incrementCouponUsage } from './coupon-actions';
import { checkFreeTicketEmail } from './free-ticket-actions';
import { completeOrder } from './order-completion';
import { prisma } from './prisma';
import { requireStripe } from './stripe';
import { ticketTiers, type TicketTierId } from './stripe-config';
import type { InvoiceLineItem, InvoiceAttendee } from './invoice-pdf';
import type Stripe from 'stripe';

export type AttendeeData = {
  email: string;
  name: string;
  role?: string;
  organisation?: string;
  ticketType: TicketTierId;
};

export type MultiTicketFormData = {
  purchaserEmail: string;
  purchaserName: string;
  purchaserRole?: string;
  purchaserOrg?: string;
  attendees: AttendeeData[];
  couponCode?: string;
};

export type InvoiceFormData = MultiTicketFormData & {
  orgName?: string;
  orgABN?: string;
  poNumber?: string;
};

/**
 * Get or create a Profile by email.
 * If the profile exists, optionally update name/title/organisation if provided.
 */
async function getOrCreateProfile(email: string, name?: string, title?: string, organisation?: string) {
  const normalizedEmail = email.toLowerCase().trim();

  let profile = await prisma.profile.findUnique({
    where: { email: normalizedEmail },
  });

  if (profile) {
    // Update profile with new info if provided and different
    const updates: { name?: string; title?: string; organisation?: string } = {};
    if (name && name !== profile.name) updates.name = name;
    if (title && title !== profile.title) updates.title = title;
    if (organisation && organisation !== profile.organisation) updates.organisation = organisation;

    if (Object.keys(updates).length > 0) {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: updates,
      });
    }
  } else {
    // Create new profile
    profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        title: title || null,
        organisation: organisation || null,
      },
    });
  }

  return profile;
}

async function getOrCreateStripeCoupon(discount: {
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  discountAmount: number;
}) {
  const stripe = requireStripe();

  // Create a Stripe coupon for this discount
  const couponConfig: Stripe.CouponCreateParams = {
    duration: 'once',
    currency: 'aud',
  };

  if (discount.type === 'percentage' || discount.type === 'free') {
    couponConfig.percent_off = discount.value;
  } else {
    couponConfig.amount_off = discount.discountAmount;
  }

  const stripeCoupon = await stripe.coupons.create(couponConfig);
  return stripeCoupon.id;
}

/**
 * Get an order by its ID with all registrations
 */
export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        registrations: {
          include: {
            profile: true,
          },
        },
        coupon: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get all orders for a purchaser email
 */
export async function getOrdersByEmail(email: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { purchaserEmail: email.toLowerCase().trim() },
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Create a multi-ticket checkout session.
 * Supports multiple attendees with different ticket types in a single order.
 */
// eslint-disable-next-line complexity -- Multi-attendee payment: free tickets, coupons, partial discounts, Stripe
export async function createMultiTicketCheckout(data: MultiTicketFormData) {
  try {
    // Check each attendee for free ticket eligibility and calculate totals
    let subtotal = 0;
    const lineItems: { price: string; quantity: number }[] = [];
    const ticketCounts: Record<string, number> = {};
    const attendeeFreeTicketStatus: boolean[] = [];

    for (const attendee of data.attendees) {
      const tier = ticketTiers.find((t) => t.id === attendee.ticketType);
      if (!tier) {
        return { success: false, error: `Invalid ticket type: ${attendee.ticketType}` };
      }

      // Check if this attendee has a free ticket
      const freeTicketCheck = await checkFreeTicketEmail(attendee.email);
      attendeeFreeTicketStatus.push(freeTicketCheck.isFree);

      if (freeTicketCheck.isFree) {
        // Don't add to subtotal or line items for free tickets
      } else {
        subtotal += tier.price;

        // Count tickets by type for Stripe line items (only paid tickets)
        const priceId = tier.stripePriceId;
        if (!priceId) {
          return { success: false, error: `Stripe price ID not configured for ${tier.name}` };
        }

        ticketCounts[priceId] = (ticketCounts[priceId] || 0) + 1;
      }
    }

    // Build line items from ticket counts (paid tickets only)
    for (const [priceId, quantity] of Object.entries(ticketCounts)) {
      lineItems.push({ price: priceId, quantity });
    }

    // Validate and apply coupon if provided
    let discount = null;
    let couponId = null;
    let discountAmount = 0;
    let totalAmount = subtotal;

    if (data.couponCode) {
      const validation = await validateCoupon(
        data.couponCode,
        data.purchaserEmail,
        data.attendees[0].ticketType
      );
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      discount = validation.discount!;

      // Apply discount to total
      if (discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free') {
        discountAmount = subtotal;
      }
      totalAmount = Math.max(0, subtotal - discountAmount);

      // Get coupon ID
      const coupon = await prisma.discountCode.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      couponId = coupon?.id || null;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        purchaserEmail: data.purchaserEmail.toLowerCase().trim(),
        purchaserName: data.purchaserName,
        orgName: data.purchaserOrg || null,
        paymentMethod: 'card',
        paymentStatus: 'pending',
        totalAmount,
        discountAmount,
        couponId,
      },
    });

    // Create profiles and registrations for each attendee
    const registrations = [];
    for (let i = 0; i < data.attendees.length; i++) {
      const attendee = data.attendees[i];
      const isFreeTicket = attendeeFreeTicketStatus[i];
      const profile = await getOrCreateProfile(attendee.email, attendee.name, attendee.role, attendee.organisation);
      const tier = ticketTiers.find((t) => t.id === attendee.ticketType)!;
      const ticketPrice = tier.price;

      const registration = await prisma.registration.create({
        data: {
          email: attendee.email.toLowerCase().trim(),
          name: attendee.name,
          ticketType: tier.name,
          ticketPrice,
          originalAmount: ticketPrice,
          discountAmount: isFreeTicket ? ticketPrice : 0, // Full discount for free tickets
          amountPaid: isFreeTicket ? 0 : ticketPrice,
          status: isFreeTicket ? 'paid' : 'pending', // Free tickets are immediately paid
          profileId: profile.id,
          orderId: order.id,
        },
      });
      registrations.push(registration);
    }

    // If total is free (all tickets free or 100% discount), complete the order immediately
    if (totalAmount === 0) {
      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
      }

      // Complete order using unified completion logic (marks as paid + sends emails)
      const completionResult = await completeOrder(order.id, {
        discountDescription: data.couponCode || 'Complimentary tickets',
      });

      if (!completionResult.success) {
        console.error('Failed to complete free multi-ticket order:', completionResult.error);
      }

      return {
        success: true,
        free: true,
        orderId: order.id,
        registrationIds: registrations.map((r) => r.id),
      };
    }

    // Create Stripe checkout session
    const stripe = requireStripe();

    // Build base URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      try {
        const headersList = await headers();
        const host = headersList.get('host');
        if (host) {
          baseUrl = `https://${host}`;
        }
      } catch (e) {
        console.log('Could not read headers:', e);
      }
    }
    if (!baseUrl) {
      baseUrl = siteConfig.url;
    }
    const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: data.purchaserEmail,
      metadata: {
        orderId: order.id,
        registrationIds: registrations.map((r) => r.id).join(','),
        attendeeCount: data.attendees.length.toString(),
        couponCode: data.couponCode || '',
      },
      success_url: `${fullBaseUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${fullBaseUrl}/register`,
    };

    // Apply discount if there is one
    if (discount && discountAmount > 0) {
      sessionConfig.discounts = [
        {
          coupon: await getOrCreateStripeCoupon({
            type: discount.type,
            value: discount.value,
            discountAmount,
          }),
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
      registrationIds: registrations.map((r) => r.id),
    };
  } catch (error) {
    console.error('Error creating multi-ticket checkout:', error);
    return { success: false, error: 'Failed to create checkout. Please try again.' };
  }
}

/**
 * Get order by Stripe session ID (for success page)
 */
export async function getOrderBySessionId(sessionId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        registrations: {
          include: {
            profile: true,
          },
        },
        coupon: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order by session:', error);
    return null;
  }
}

/**
 * Create an invoice order with PDF invoice sent via email.
 * Uses bank transfer for payment instead of Stripe (not available in AU).
 */
// eslint-disable-next-line complexity -- Invoice generation with free tickets, coupons, PDF creation, email sending
export async function createInvoiceOrder(data: InvoiceFormData) {
  try {
    // Check each attendee for free ticket eligibility and calculate totals
    let subtotal = 0;
    const ticketCounts: Record<string, { tier: (typeof ticketTiers)[number]; count: number }> = {};
    const attendeeFreeTicketStatus: boolean[] = [];

    for (const attendee of data.attendees) {
      const tier = ticketTiers.find((t) => t.id === attendee.ticketType);
      if (!tier) {
        return { success: false, error: `Invalid ticket type: ${attendee.ticketType}` };
      }

      // Check if this attendee has a free ticket
      const freeTicketCheck = await checkFreeTicketEmail(attendee.email);
      attendeeFreeTicketStatus.push(freeTicketCheck.isFree);

      if (freeTicketCheck.isFree) {
        // Don't add to subtotal for free tickets
      } else {
        subtotal += tier.price;

        // Count tickets by type (only paid tickets)
        if (!ticketCounts[tier.id]) {
          ticketCounts[tier.id] = { tier, count: 0 };
        }
        ticketCounts[tier.id].count++;
      }
    }

    // Validate and apply coupon if provided
    let discount = null;
    let couponId = null;
    let discountAmount = 0;
    let totalAmount = subtotal;

    if (data.couponCode) {
      const validation = await validateCoupon(
        data.couponCode,
        data.purchaserEmail,
        data.attendees[0].ticketType
      );
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      discount = validation.discount!;

      // Apply discount to total
      if (discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free') {
        discountAmount = subtotal;
      }
      totalAmount = Math.max(0, subtotal - discountAmount);

      // Get coupon ID
      const coupon = await prisma.discountCode.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      couponId = coupon?.id || null;
    }

    // Generate invoice number
    const { generateInvoiceNumber } = await import('./invoice-pdf');
    const invoiceNumber = await generateInvoiceNumber(prisma);
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    // Create order in database
    const order = await prisma.order.create({
      data: {
        purchaserEmail: data.purchaserEmail.toLowerCase().trim(),
        purchaserName: data.purchaserName,
        orgName: data.orgName || data.purchaserOrg || null,
        orgABN: data.orgABN || null,
        poNumber: data.poNumber || null,
        paymentMethod: 'invoice',
        paymentStatus: 'pending',
        totalAmount,
        discountAmount,
        couponId,
        invoiceNumber,
        invoiceDueDate: dueDate,
      },
    });

    // Create profiles and registrations for each attendee
    const registrations = [];
    for (let i = 0; i < data.attendees.length; i++) {
      const attendee = data.attendees[i];
      const isFreeTicket = attendeeFreeTicketStatus[i];
      const profile = await getOrCreateProfile(attendee.email, attendee.name, attendee.role, attendee.organisation);
      const tier = ticketTiers.find((t) => t.id === attendee.ticketType)!;
      const ticketPrice = tier.price;

      const registration = await prisma.registration.create({
        data: {
          email: attendee.email.toLowerCase().trim(),
          name: attendee.name,
          ticketType: tier.name,
          ticketPrice,
          originalAmount: ticketPrice,
          discountAmount: isFreeTicket ? ticketPrice : 0, // Full discount for free tickets
          amountPaid: isFreeTicket ? 0 : ticketPrice,
          status: isFreeTicket ? 'paid' : 'pending', // Free tickets are immediately paid
          profileId: profile.id,
          orderId: order.id,
        },
      });
      registrations.push(registration);
    }

    // If total is free (all tickets free or 100% discount), complete the order immediately
    if (totalAmount === 0) {
      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
      }

      // Complete order using unified completion logic (marks as paid + sends emails)
      const completionResult = await completeOrder(order.id, {
        discountDescription: data.couponCode || 'Complimentary tickets',
      });

      if (!completionResult.success) {
        console.error('Failed to complete free invoice order:', completionResult.error);
      }

      return {
        success: true,
        free: true,
        orderId: order.id,
        registrationIds: registrations.map((r) => r.id),
      };
    }

    // Build invoice line items for PDF
    const { generateInvoicePDF, calculateGST } = await import('./invoice-pdf');

    const lineItems: InvoiceLineItem[] = [];
    for (const { tier, count } of Object.values(ticketCounts)) {
      const unitPrice = tier.price;
      lineItems.push({
        description: `${tier.name} Ticket - AI Safety Forum 2026`,
        quantity: count,
        unitPrice,
        amount: unitPrice * count,
      });
    }

    // Build attendees list for PDF
    const attendeesForPDF: InvoiceAttendee[] = data.attendees.map((a, i) => {
      const tier = ticketTiers.find((t) => t.id === a.ticketType)!;
      return {
        name: a.name,
        email: a.email,
        ticketType: attendeeFreeTicketStatus[i]
          ? `${tier.name} (Complimentary)`
          : tier.name,
      };
    });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      invoiceDate,
      dueDate,
      purchaser: {
        name: data.purchaserName,
        email: data.purchaserEmail,
        organisation: data.orgName || data.purchaserOrg,
        abn: data.orgABN,
      },
      poNumber: data.poNumber,
      lineItems,
      subtotal,
      gstAmount: calculateGST(totalAmount),
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      discountDescription: discount?.description || data.couponCode,
      total: totalAmount,
      attendees: attendeesForPDF,
    });

    // Send invoice email with PDF attachment
    const { sendInvoiceEmail } = await import('./brevo');
    await sendInvoiceEmail({
      email: data.purchaserEmail,
      name: data.purchaserName,
      organisation: data.orgName || data.purchaserOrg,
      invoiceNumber,
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
      totalAmount,
      attendeeCount: data.attendees.length,
      poNumber: data.poNumber,
      pdfBuffer,
    });

    return {
      success: true,
      invoiceSent: true,
      orderId: order.id,
      invoiceNumber,
      registrationIds: registrations.map((r) => r.id),
    };
  } catch (error) {
    console.error('Error creating invoice order:', error);

    let errorMessage = 'Failed to create invoice. Please try again.';
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      errorMessage = `Invoice error: ${error.message}`;
    }

    return { success: false, error: errorMessage };
  }
}
