'use server';

import { eventConfig } from './config';
import { prisma } from './prisma';
import { ticketTiers, type TicketTierId } from './stripe-config';

export type CouponValidationResult = {
  valid: boolean;
  error?: string;
  grantsAccess?: boolean;
  couponId?: string;
  discount?: {
    type: 'percentage' | 'fixed' | 'free';
    value: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    description: string;
  };
};

// eslint-disable-next-line complexity -- Coupon validation with date, usage, email, ticket type, and registration mode checks
export async function validateCoupon(
  code: string,
  email: string,
  ticketType: TicketTierId
): Promise<CouponValidationResult> {
  try {
    // Find the coupon code (case-insensitive)
    const coupon = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    // Check if coupon is active
    if (!coupon.active) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, error: 'This coupon is not yet valid' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check if email is allowed (if email restriction exists)
    if (coupon.allowedEmails.length > 0) {
      const emailAllowed = coupon.allowedEmails.some(
        (allowedEmail: string) => allowedEmail.toLowerCase() === email.toLowerCase()
      );
      if (!emailAllowed) {
        return { valid: false, error: 'This coupon is not valid for your email address' };
      }
    }

    // Check if ticket type is valid
    if (coupon.validFor.length > 0 && !coupon.validFor.includes(ticketType)) {
      return { valid: false, error: 'This coupon is not valid for the selected ticket type' };
    }

    // Calculate discount
    const ticketTier = ticketTiers.find((t) => t.id === ticketType);
    if (!ticketTier) {
      return { valid: false, error: 'Invalid ticket type' };
    }

    const originalAmount: number = ticketTier.price;
    let discountAmount: number = 0;
    let finalAmount: number = originalAmount;

    if (coupon.type === 'free') {
      discountAmount = originalAmount;
      finalAmount = 0;
    } else if (coupon.type === 'percentage') {
      discountAmount = Math.round((originalAmount * coupon.value) / 100);
      finalAmount = originalAmount - discountAmount;
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, originalAmount); // Can't discount more than ticket price
      finalAmount = originalAmount - discountAmount;
    }

    // Reject access-only codes that provide no actual discount in open mode
    // In gated mode, these codes are valid (they granted access to get here)
    if (discountAmount === 0 && coupon.grantsAccess && eventConfig.registrationMode === 'open') {
      return { valid: false, error: 'This code is for early access only and registration is now open' };
    }

    return {
      valid: true,
      grantsAccess: coupon.grantsAccess,
      couponId: coupon.id,
      discount: {
        type: coupon.type as 'percentage' | 'fixed' | 'free',
        value: coupon.value,
        originalAmount,
        discountAmount,
        finalAmount,
        description: coupon.description,
      },
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon code' };
  }
}

/**
 * Validate an access code for gated registration
 * Similar to validateCoupon but specifically checks grantsAccess flag
 * and doesn't require a ticket type (validated before checkout)
 */
export async function validateAccessCode(
  code: string,
  email?: string
): Promise<CouponValidationResult> {
  try {
    const coupon = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, error: 'Invalid code' };
    }

    if (!coupon.active) {
      return { valid: false, error: 'This code is no longer active' };
    }

    if (!coupon.grantsAccess) {
      return { valid: false, error: 'This code does not grant early access' };
    }

    // Check date validity
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, error: 'This code is not yet valid' };
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, error: 'This code has expired' };
    }

    // Check usage limit
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'This code has reached its usage limit' };
    }

    // Check email restriction if provided
    if (email && coupon.allowedEmails.length > 0) {
      const emailAllowed = coupon.allowedEmails.some(
        (allowedEmail: string) => allowedEmail.toLowerCase() === email.toLowerCase()
      );
      if (!emailAllowed) {
        return { valid: false, error: 'This code is not valid for your email address' };
      }
    }

    // Return basic discount info (full calculation done at checkout with ticket type)
    return {
      valid: true,
      grantsAccess: true,
      couponId: coupon.id,
      discount: coupon.type !== 'percentage' || coupon.value > 0
        ? {
            type: coupon.type as 'percentage' | 'fixed' | 'free',
            value: coupon.value,
            originalAmount: 0,
            discountAmount: 0,
            finalAmount: 0,
            description: coupon.description,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error validating access code:', error);
    return { valid: false, error: 'Failed to validate code' };
  }
}

export async function incrementCouponUsage(code: string) {
  try {
    await prisma.discountCode.update({
      where: { code: code.toUpperCase() },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
  }
}

export async function createDiscountCode(data: {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  validFor?: string[];
  allowedEmails?: string[];
  maxUses?: number;
  validFrom?: Date;
  validUntil?: Date;
  grantsAccess?: boolean;
}) {
  try {
    const coupon = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.type === 'free' ? 100 : data.value,
        validFor: data.validFor || [],
        allowedEmails: data.allowedEmails || [],
        maxUses: data.maxUses || null,
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
        grantsAccess: data.grantsAccess || false,
        active: true,
      },
    });
    return { success: true, coupon };
  } catch (error) {
    console.error('Error creating discount code:', error);
    return { success: false, error: 'Failed to create discount code' };
  }
}

export async function listDiscountCodes() {
  try {
    const coupons = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });
    return coupons;
  } catch (error) {
    console.error('Error listing discount codes:', error);
    return [];
  }
}
