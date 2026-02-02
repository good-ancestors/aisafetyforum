import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

/**
 * Cached data fetching functions for admin pages.
 * These use Next.js unstable_cache to reduce database load from RSC prefetching.
 *
 * Cache keys are tagged so they can be revalidated when data changes.
 * Default revalidation is 30 seconds - fresh enough for admin use.
 */

// ============================================
// Invoice Orders
// ============================================

export const getCachedInvoiceOrders = unstable_cache(
  async (status?: 'pending' | 'paid' | 'all') => {
    const where = {
      paymentMethod: 'invoice',
      ...(status && status !== 'all' ? { paymentStatus: status } : {}),
    };

    return prisma.order.findMany({
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
  },
  ['invoice-orders'],
  { revalidate: 30, tags: ['orders', 'invoices'] }
);

// ============================================
// All Orders
// ============================================

export const getCachedAllOrders = unstable_cache(
  async (filters?: {
    status?: 'pending' | 'paid' | 'cancelled' | 'failed';
    paymentMethod?: 'card' | 'invoice';
  }) => {
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
  },
  ['all-orders'],
  { revalidate: 30, tags: ['orders'] }
);

export const getCachedOrderStats = unstable_cache(
  async () => {
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
  },
  ['order-stats'],
  { revalidate: 30, tags: ['orders'] }
);

// ============================================
// Registrations
// ============================================

export const getCachedAllRegistrations = unstable_cache(
  async (filters?: {
    status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
  }) => {
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
  },
  ['all-registrations'],
  { revalidate: 30, tags: ['registrations'] }
);

export const getCachedRegistrationStats = unstable_cache(
  async () => {
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
  },
  ['registration-stats'],
  { revalidate: 30, tags: ['registrations'] }
);

// ============================================
// Applications
// ============================================

export const getCachedSpeakerProposals = unstable_cache(
  async (filters?: { status?: 'pending' | 'accepted' | 'rejected' }) => {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;

    return prisma.speakerProposal.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['speaker-proposals'],
  { revalidate: 30, tags: ['applications', 'speakers'] }
);

export const getCachedScholarshipApplications = unstable_cache(
  async (filters?: { status?: 'pending' | 'approved' | 'rejected' }) => {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;

    return prisma.fundingApplication.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  },
  ['scholarship-applications'],
  { revalidate: 30, tags: ['applications', 'scholarships'] }
);

export const getCachedApplicationStats = unstable_cache(
  async () => {
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
  },
  ['application-stats'],
  { revalidate: 30, tags: ['applications'] }
);

// ============================================
// Profiles
// ============================================

export const getCachedAllProfiles = unstable_cache(
  async (filters?: { isAdmin?: boolean }) => {
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
  },
  ['all-profiles'],
  { revalidate: 30, tags: ['profiles'] }
);

export const getCachedProfileStats = unstable_cache(
  async () => {
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
  },
  ['profile-stats'],
  { revalidate: 30, tags: ['profiles'] }
);

// ============================================
// Discount Codes
// ============================================

export const getCachedDiscountCodes = unstable_cache(
  async () => {
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
  },
  ['discount-codes'],
  { revalidate: 30, tags: ['discounts'] }
);

// ============================================
// Free Ticket Emails
// ============================================

export const getCachedFreeTicketEmails = unstable_cache(
  async (activeOnly = false) => {
    const where = activeOnly ? { active: true } : {};
    return prisma.freeTicketEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },
  ['free-ticket-emails'],
  { revalidate: 30, tags: ['discounts', 'free-tickets'] }
);
