'use server';

import { requireStripe } from './stripe';
import { prisma } from './prisma';
import { ticketTiers, type TicketTierId, isEarlyBirdActive } from './stripe-config';
import { revalidatePath } from 'next/cache';
import { validateCoupon, incrementCouponUsage } from './coupon-actions';
import { checkFreeTicketEmail } from './free-ticket-actions';
import { headers } from 'next/headers';

export type RegistrationFormData = {
  email: string;
  name: string;
  organisation?: string;
  ticketType: TicketTierId;
  couponCode?: string;
};

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

    // Create a registration record in pending state
    const registration = await prisma.registration.create({
      data: {
        email: data.email,
        name: data.name,
        organisation: data.organisation || null,
        ticketType: earlyBird ? `${ticketTier.name} (Early Bird)` : ticketTier.name,
        originalAmount: currentPrice,
        discountAmount: discountAmount,
        amountPaid: finalAmount,
        couponId: couponId,
        status: 'pending',
      },
    });

    // If ticket is free (100% discount), mark as paid immediately
    if (finalAmount === 0) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: { status: 'paid' },
      });

      // Increment coupon usage
      if (data.couponCode) {
        await incrementCouponUsage(data.couponCode);
      }

      return {
        success: true,
        free: true,
        registrationId: registration.id,
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
      baseUrl = 'https://aisafetyforum.vercel.app';
    }

    // Ensure baseUrl has protocol
    const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const sessionConfig: any = {
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

    // Update registration with Stripe session ID
    await prisma.registration.update({
      where: { id: registration.id },
      data: { stripeSessionId: session.id },
    });

    return { success: true, sessionId: session.id, url: session.url };
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
  const couponConfig: any = {
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
      },
    });
    return registration;
  } catch (error) {
    console.error('Error fetching registration:', error);
    return null;
  }
}
