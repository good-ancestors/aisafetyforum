'use server';

import { requireStripe } from './stripe';
import { prisma } from './prisma';
import { ticketTiers, type TicketTierId, isEarlyBirdActive } from './stripe-config';
import { siteConfig } from './config';
import Stripe from 'stripe';
import { validateCoupon, incrementCouponUsage } from './coupon-actions';
import { checkFreeTicketEmail } from './free-ticket-actions';
import { headers } from 'next/headers';
import type { InvoiceLineItem, InvoiceAttendee } from './invoice-pdf';

export type RegistrationFormData = {
  email: string;
  name: string;
  organisation?: string;
  ticketType: TicketTierId;
  couponCode?: string;
};

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

export async function createCheckoutSession(data: RegistrationFormData) {
  try {
    // Find the ticket tier
    const ticketTier = ticketTiers.find(t => t.id === data.ticketType);
    if (!ticketTier) {
      return { success: false, error: 'Invalid ticket type' };
    }

    // Check if early bird pricing is active
    const earlyBird = isEarlyBirdActive();
    const currentPrice = earlyBird ? ticketTier.earlyBirdPrice : ticketTier.price;

    // Check if email is on free ticket list first
    const freeTicketCheck = await checkFreeTicketEmail(data.email);

    // Validate and apply coupon if provided
    let discount = null;
    let couponId = null;
    let finalAmount: number = currentPrice;
    let discountAmount: number = 0;

    if (freeTicketCheck.isFree) {
      // Email is on free ticket list - automatically free
      finalAmount = 0;
      discountAmount = currentPrice;
    } else if (data.couponCode) {
      // Apply coupon code
      const validation = await validateCoupon(data.couponCode, data.email, data.ticketType);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      discount = validation.discount!;
      finalAmount = discount.finalAmount;
      discountAmount = discount.discountAmount;

      // Get coupon ID for database reference
      const coupon = await prisma.discountCode.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      couponId = coupon?.id || null;
    }

    // Get or create profile for this attendee
    const profile = await getOrCreateProfile(data.email, data.name, undefined, data.organisation);

    // Create an order for this purchase
    const order = await prisma.order.create({
      data: {
        purchaserEmail: data.email.toLowerCase().trim(),
        purchaserName: data.name,
        paymentMethod: 'card',
        paymentStatus: 'pending',
        totalAmount: finalAmount,
        discountAmount: discountAmount,
        couponId: couponId,
      },
    });

    // Create a registration record linked to profile and order
    const registration = await prisma.registration.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        organisation: data.organisation || null,
        ticketType: earlyBird ? `${ticketTier.name} (Early Bird)` : ticketTier.name,
        ticketPrice: currentPrice,
        originalAmount: currentPrice,
        discountAmount: discountAmount,
        amountPaid: finalAmount,
        couponId: couponId,
        status: 'pending',
        profileId: profile.id,
        orderId: order.id,
      },
    });

    // If ticket is free (100% discount), mark as paid immediately
    if (finalAmount === 0) {
      await prisma.$transaction([
        prisma.registration.update({
          where: { id: registration.id },
          data: { status: 'paid' },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid' },
        }),
      ]);

      // Increment coupon usage
      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
      }

      return {
        success: true,
        free: true,
        registrationId: registration.id,
        orderId: order.id,
      };
    }

    // Get the correct Stripe price ID based on early bird status
    const stripePriceId = earlyBird ? ticketTier.stripeEarlyBirdPriceId : ticketTier.stripePriceId;
    if (!stripePriceId) {
      return { success: false, error: 'Stripe price ID not configured for this ticket type' };
    }

    // Create Stripe checkout session
    const stripe = requireStripe();

    // Build base URL with fallback logic
    // Priority: NEXT_PUBLIC_BASE_URL > request host > fallback
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // If not set, try to get from request headers
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

    // Final fallback
    if (!baseUrl) {
      baseUrl = siteConfig.url;
    }

    // Ensure baseUrl has protocol
    const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: data.email,
      metadata: {
        registrationId: registration.id,
        orderId: order.id,
        ticketType: data.ticketType,
        couponCode: data.couponCode || '',
      },
      success_url: `${fullBaseUrl}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${fullBaseUrl}/register`,
    };

    // Apply discount if there is one
    if (discount && discountAmount > 0) {
      sessionConfig.discounts = [
        {
          coupon: await getOrCreateStripeCoupon(discount),
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Update registration and order with Stripe session ID
    await prisma.$transaction([
      prisma.registration.update({
        where: { id: registration.id },
        data: { stripeSessionId: session.id },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      }),
    ]);

    return { success: true, sessionId: session.id, url: session.url, orderId: order.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: 'Failed to create checkout session. Please try again.' };
  }
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

export async function getRegistrationBySessionId(sessionId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        coupon: true,
        profile: true,
        order: true,
      },
    });
    return registration;
  } catch (error) {
    console.error('Error fetching registration:', error);
    return null;
  }
}

export async function getRegistrationById(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        coupon: true,
        profile: true,
        order: true,
      },
    });
    return registration;
  } catch (error) {
    console.error('Error fetching registration:', error);
    return null;
  }
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
export async function createMultiTicketCheckout(data: MultiTicketFormData) {
  try {
    const earlyBird = isEarlyBirdActive();

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
        const price = earlyBird ? tier.earlyBirdPrice : tier.price;
        subtotal += price;

        // Count tickets by type for Stripe line items (only paid tickets)
        const priceId = earlyBird ? tier.stripeEarlyBirdPriceId : tier.stripePriceId;
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
      const ticketPrice = earlyBird ? tier.earlyBirdPrice : tier.price;

      const registration = await prisma.registration.create({
        data: {
          email: attendee.email.toLowerCase().trim(),
          name: attendee.name,
          ticketType: earlyBird ? `${tier.name} (Early Bird)` : tier.name,
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

    // If total is free (all tickets free or 100% discount), mark as paid immediately
    if (totalAmount === 0) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid' },
        }),
        ...registrations.map((reg) =>
          prisma.registration.update({
            where: { id: reg.id },
            data: { status: 'paid' },
          })
        ),
      ]);

      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
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
export async function createInvoiceOrder(data: InvoiceFormData) {
  try {
    const earlyBird = isEarlyBirdActive();

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
        const price = earlyBird ? tier.earlyBirdPrice : tier.price;
        subtotal += price;

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
      const ticketPrice = earlyBird ? tier.earlyBirdPrice : tier.price;

      const registration = await prisma.registration.create({
        data: {
          email: attendee.email.toLowerCase().trim(),
          name: attendee.name,
          ticketType: earlyBird ? `${tier.name} (Early Bird)` : tier.name,
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

    // If total is free (all tickets free or 100% discount), mark as paid immediately
    if (totalAmount === 0) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid' },
        }),
        ...registrations.map((reg) =>
          prisma.registration.update({
            where: { id: reg.id },
            data: { status: 'paid' },
          })
        ),
      ]);

      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
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
      const unitPrice = earlyBird ? tier.earlyBirdPrice : tier.price;
      const description = earlyBird
        ? `${tier.name} Ticket (Early Bird) - AI Safety Forum 2026`
        : `${tier.name} Ticket - AI Safety Forum 2026`;
      lineItems.push({
        description,
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
          : earlyBird
            ? `${tier.name} (Early Bird)`
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
