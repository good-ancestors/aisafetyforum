import { NextResponse } from 'next/server';
import { generateInvoicePDF, calculateGST, type InvoiceData } from '@/lib/invoice-pdf';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Fetch the order with registrations
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow invoice download for invoice payment method orders
    if (order.paymentMethod !== 'invoice') {
      return NextResponse.json(
        { error: 'Invoice not available for this order' },
        { status: 400 }
      );
    }

    // Build line items from registrations
    const lineItems = order.registrations.map((reg) => {
      return {
        description: `${reg.ticketType} - ${reg.name}`,
        quantity: 1,
        unitPrice: reg.originalAmount,
        amount: reg.originalAmount,
      };
    });

    // Calculate GST (included in total, 1/11th)
    const gstAmount = calculateGST(order.totalAmount);

    // Build invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber: order.invoiceNumber || `AISF-${order.id.slice(-8).toUpperCase()}`,
      invoiceDate: order.createdAt,
      dueDate: order.invoiceDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      purchaser: {
        name: order.purchaserName,
        email: order.purchaserEmail,
        organisation: order.orgName || undefined,
        abn: order.orgABN || undefined,
      },
      poNumber: order.poNumber || undefined,
      lineItems,
      subtotal: order.totalAmount + order.discountAmount,
      gstAmount,
      discountAmount: order.discountAmount > 0 ? order.discountAmount : undefined,
      discountDescription: order.discountAmount > 0 ? 'Discount applied' : undefined,
      total: order.totalAmount,
      attendees: order.registrations.map((reg) => ({
        name: reg.name,
        email: reg.email,
        ticketType: reg.ticketType,
      })),
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
