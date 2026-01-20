'use server';

import { prisma } from './prisma';

/**
 * Check if an email is on the free ticket list
 */
export async function checkFreeTicketEmail(email: string) {
  try {
    const freeTicket = await prisma.freeTicketEmail.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (freeTicket && freeTicket.active) {
      return {
        isFree: true,
        reason: freeTicket.reason,
      };
    }

    return { isFree: false };
  } catch (error) {
    console.error('Error checking free ticket email:', error);
    return { isFree: false };
  }
}

/**
 * Add an email to the free ticket list
 */
export async function addFreeTicketEmail(email: string, reason: string) {
  try {
    const freeTicket = await prisma.freeTicketEmail.create({
      data: {
        email: email.toLowerCase(),
        reason,
        active: true,
      },
    });
    return { success: true, freeTicket };
  } catch (error) {
    console.error('Error adding free ticket email:', error);
    return { success: false, error: 'Failed to add email to free ticket list' };
  }
}

/**
 * Add multiple emails at once
 */
export async function addBulkFreeTicketEmails(emails: string[], reason: string) {
  try {
    const results = await Promise.allSettled(
      emails.map((email) =>
        prisma.freeTicketEmail.create({
          data: {
            email: email.toLowerCase(),
            reason,
            active: true,
          },
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      added: successful,
      failed,
      total: emails.length,
    };
  } catch (error) {
    console.error('Error adding bulk free ticket emails:', error);
    return { success: false, error: 'Failed to add emails to free ticket list' };
  }
}

/**
 * Remove an email from the free ticket list
 */
export async function removeFreeTicketEmail(email: string) {
  try {
    await prisma.freeTicketEmail.delete({
      where: {
        email: email.toLowerCase(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing free ticket email:', error);
    return { success: false, error: 'Failed to remove email from free ticket list' };
  }
}

/**
 * Deactivate an email (soft delete)
 */
export async function deactivateFreeTicketEmail(email: string) {
  try {
    await prisma.freeTicketEmail.update({
      where: {
        email: email.toLowerCase(),
      },
      data: {
        active: false,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deactivating free ticket email:', error);
    return { success: false, error: 'Failed to deactivate email' };
  }
}

/**
 * List all free ticket emails
 */
export async function listFreeTicketEmails(activeOnly = true) {
  try {
    const where = activeOnly ? { active: true } : {};
    const emails = await prisma.freeTicketEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return emails;
  } catch (error) {
    console.error('Error listing free ticket emails:', error);
    return [];
  }
}
