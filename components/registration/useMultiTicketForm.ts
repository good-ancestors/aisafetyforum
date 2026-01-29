'use client';

import { useState } from 'react';
import { validateCoupon } from '@/lib/coupon-actions';
import { checkFreeTicketEmail } from '@/lib/free-ticket-actions';
import { ticketTiers, isEarlyBirdActive, type TicketTierId } from '@/lib/stripe-config';
import type { AttendeeFormData } from './AttendeeCard';

interface InitialProfile {
  email: string;
  name: string;
  role: string;
  organisation: string;
}

interface PreAppliedDiscount {
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  description: string;
}

interface Discount {
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  description?: string;
}

interface UseMultiTicketFormProps {
  initialProfile?: InitialProfile;
  preValidatedCode?: string | null;
  preAppliedDiscount?: PreAppliedDiscount | null;
}

// eslint-disable-next-line max-lines-per-function -- Cohesive hook managing related form state (purchaser, attendees, coupon, payment)
export function useMultiTicketForm({
  initialProfile,
  preValidatedCode,
  preAppliedDiscount,
}: UseMultiTicketFormProps) {
  // Purchaser state
  const [purchaserEmail, setPurchaserEmail] = useState(initialProfile?.email || '');
  const [purchaserName, setPurchaserName] = useState(initialProfile?.name || '');
  const [purchaserRole, setPurchaserRole] = useState(initialProfile?.role || '');
  const [purchaserOrg, setPurchaserOrg] = useState(initialProfile?.organisation || '');
  const [purchaserIsAttendee, setPurchaserIsAttendee] = useState(true);
  const [purchaserFreeTicket, setPurchaserFreeTicket] = useState<string | null>(null);

  // Attendees
  const [attendees, setAttendees] = useState<AttendeeFormData[]>([
    {
      email: initialProfile?.email || '',
      name: initialProfile?.name || '',
      role: initialProfile?.role || '',
      organisation: initialProfile?.organisation || '',
      ticketType: '',
      freeTicketReason: null,
    },
  ]);

  // Coupon state
  const [couponCode, setCouponCode] = useState(preValidatedCode || '');
  const [couponApplied, setCouponApplied] = useState(!!preAppliedDiscount);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(preAppliedDiscount || null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  const [orgABN, setOrgABN] = useState('');
  const [poNumber, setPoNumber] = useState('');

  const earlyBird = isEarlyBirdActive();

  // --- Free ticket check ---
  async function checkEmailForFreeTicket(email: string): Promise<string | null> {
    if (!email || !email.includes('@')) return null;
    const result = await checkFreeTicketEmail(email);
    return result.isFree ? (result.reason || 'Complimentary registration') : null;
  }

  // --- Purchaser handlers ---
  function handlePurchaserEmailChange(value: string) {
    setPurchaserEmail(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], email: value }, ...prev.slice(1)]);
    }
  }

  async function handlePurchaserEmailBlur() {
    const reason = await checkEmailForFreeTicket(purchaserEmail);
    setPurchaserFreeTicket(reason);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], freeTicketReason: reason }, ...prev.slice(1)]);
    }
  }

  function handlePurchaserNameChange(value: string) {
    setPurchaserName(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], name: value }, ...prev.slice(1)]);
    }
  }

  function handlePurchaserRoleChange(value: string) {
    setPurchaserRole(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], role: value }, ...prev.slice(1)]);
    }
  }

  function handlePurchaserOrgChange(value: string) {
    setPurchaserOrg(value);
    if (purchaserIsAttendee) {
      setAttendees((prev) => [{ ...prev[0], organisation: value }, ...prev.slice(1)]);
    }
  }

  function handlePurchaserIsAttendeeChange(checked: boolean) {
    setPurchaserIsAttendee(checked);
    if (checked) {
      setAttendees((prev) => [
        { ...prev[0], email: purchaserEmail, name: purchaserName, role: purchaserRole, organisation: purchaserOrg, freeTicketReason: purchaserFreeTicket },
        ...prev.slice(1),
      ]);
    } else {
      setAttendees((prev) => [
        { email: '', name: '', role: '', organisation: '', ticketType: prev[0].ticketType, freeTicketReason: null },
        ...prev.slice(1),
      ]);
    }
  }

  // --- Attendee handlers ---
  async function handleAttendeeEmailBlur(index: number) {
    const email = index === 0 && purchaserIsAttendee ? purchaserEmail : attendees[index].email;
    const reason = await checkEmailForFreeTicket(email);
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, freeTicketReason: reason } : a))
    );
    if (index === 0 && purchaserIsAttendee) {
      setPurchaserFreeTicket(reason);
    }
  }

  function addAttendee() {
    setAttendees((prev) => [
      ...prev,
      { email: '', name: '', role: '', organisation: purchaserOrg, ticketType: '', freeTicketReason: null },
    ]);
  }

  function removeAttendee(index: number) {
    if (attendees.length > 1) {
      setAttendees((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function updateAttendee(index: number, field: keyof AttendeeFormData, value: string) {
    setAttendees((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  // --- Coupon handlers ---
  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    const firstTicketType = attendees[0].ticketType || 'standard';
    const result = await validateCoupon(couponCode, purchaserEmail, firstTicketType as TicketTierId);

    if (result.valid && result.discount) {
      setCouponApplied(true);
      setDiscount(result.discount);
      setCouponError(null);
    } else {
      setCouponApplied(false);
      setDiscount(null);
      setCouponError(result.error || 'Invalid coupon code');
    }

    setValidatingCoupon(false);
  }

  function handleRemoveCoupon() {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(null);
    setCouponError(null);
  }

  // --- Calculations ---
  function calculateTotal() {
    let subtotal = 0;
    let freeTicketCount = 0;

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const hasFreeTicket = i === 0 && purchaserIsAttendee ? purchaserFreeTicket : attendee.freeTicketReason;

      if (attendee.ticketType) {
        const tier = ticketTiers.find((t) => t.id === attendee.ticketType);
        if (tier) {
          if (hasFreeTicket) {
            freeTicketCount++;
          } else {
            subtotal += earlyBird ? tier.earlyBirdPrice : tier.price;
          }
        }
      }
    }

    let discountAmount = 0;
    if (couponApplied && discount && subtotal > 0) {
      if (discount.type === 'percentage') {
        discountAmount = Math.round(subtotal * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free') {
        discountAmount = subtotal;
      }
    }

    return {
      subtotal,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
      freeTicketCount,
    };
  }

  // --- Validation ---
  function getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!purchaserEmail) errors.push('Enter your email address');
    if (!purchaserName) errors.push('Enter your name');

    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const isFirstAndPurchaser = i === 0 && purchaserIsAttendee;
      const email = isFirstAndPurchaser ? purchaserEmail : attendee.email;
      const name = isFirstAndPurchaser ? purchaserName : attendee.name;

      if (!isFirstAndPurchaser) {
        if (!email) errors.push(`Enter email for attendee ${i + 1}`);
        if (!name) errors.push(`Enter name for attendee ${i + 1}`);
      }

      if (!attendee.ticketType) errors.push(`Select ticket type for attendee ${i + 1}`);
    }

    return errors;
  }

  // --- Build effective attendees for submission ---
  function getEffectiveAttendees() {
    return purchaserIsAttendee
      ? [
          {
            email: purchaserEmail,
            name: purchaserName,
            role: purchaserRole,
            organisation: purchaserOrg,
            ticketType: attendees[0].ticketType,
          },
          ...attendees.slice(1),
        ]
      : attendees;
  }

  const totals = calculateTotal();
  const validationErrors = getValidationErrors();
  const isFormValid = validationErrors.length === 0;

  return {
    // Purchaser state
    purchaserEmail,
    purchaserName,
    purchaserRole,
    purchaserOrg,
    purchaserIsAttendee,
    purchaserFreeTicket,

    // Purchaser handlers
    handlePurchaserEmailChange,
    handlePurchaserEmailBlur,
    handlePurchaserNameChange,
    handlePurchaserRoleChange,
    handlePurchaserOrgChange,
    handlePurchaserIsAttendeeChange,

    // Attendees
    attendees,
    addAttendee,
    removeAttendee,
    updateAttendee,
    handleAttendeeEmailBlur,

    // Coupon
    couponCode,
    setCouponCode,
    couponApplied,
    couponError,
    discount,
    validatingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,

    // Payment
    paymentMethod,
    setPaymentMethod,
    orgABN,
    setOrgABN,
    poNumber,
    setPoNumber,

    // Computed
    earlyBird,
    totals,
    validationErrors,
    isFormValid,
    getEffectiveAttendees,
  };
}
