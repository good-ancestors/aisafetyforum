import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';
import { eventConfig } from './config';

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0a1f5c',
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a1f5c',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#5c6670',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f5c',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a1f5c',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#5c6670',
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#0a1f5c',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#0a1f5c',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableCell: {
    color: '#333333',
  },
  colDescription: { flex: 3 },
  colQty: { width: 50, textAlign: 'center' },
  colUnitPrice: { width: 80, textAlign: 'right' },
  colAmount: { width: 80, textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    width: 250,
  },
  totalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 20,
    color: '#5c6670',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    width: 250,
    borderTopWidth: 2,
    borderTopColor: '#0a1f5c',
    marginTop: 5,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 20,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0a1f5c',
  },
  grandTotalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0a1f5c',
  },
  bankDetails: {
    backgroundColor: '#f0f4f8',
    padding: 15,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
  },
  bankTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a1f5c',
    marginBottom: 10,
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bankLabel: {
    width: 120,
    color: '#5c6670',
  },
  bankValue: {
    flex: 1,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#5c6670',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e0e4e8',
    paddingTop: 15,
  },
  dueNotice: {
    backgroundColor: '#fff3cd',
    padding: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  dueNoticeText: {
    color: '#856404',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  attendeesList: {
    marginTop: 10,
  },
  attendee: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e4e8',
  },
  attendeeName: {
    flex: 1,
  },
  attendeeEmail: {
    flex: 1,
    color: '#5c6670',
  },
  attendeeTicket: {
    width: 150,
    textAlign: 'right',
    color: '#5c6670',
  },
});

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  amount: number; // in cents
}

export interface InvoiceAttendee {
  name: string;
  email: string;
  ticketType: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  purchaser: {
    name: string;
    email: string;
    organisation?: string;
    abn?: string;
  };
  poNumber?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number; // in cents
  gstAmount: number; // in cents (included in subtotal, 1/11th of total)
  discountAmount?: number; // in cents
  discountDescription?: string;
  total: number; // in cents
  attendees: InvoiceAttendee[];
}

// Calculate GST (10% inclusive - i.e., GST is 1/11 of the total)
export function calculateGST(amountInCents: number): number {
  return Math.round(amountInCents / 11);
}

// Format currency for display
function formatCurrency(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Invoice PDF Component
const InvoiceDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const { organization, year, datesLong, venueLong } = eventConfig;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>TAX INVOICE</Text>
            <Text style={styles.subtitle}>Australian AI Safety Forum {year}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={styles.subtitle}>Date: {formatDate(data.invoiceDate)}</Text>
            <Text style={styles.subtitle}>Due: {formatDate(data.dueDate)}</Text>
          </View>
        </View>

        {/* From / To sections */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={{ fontWeight: 'bold' }}>{organization.name}</Text>
            <Text>ABN: {organization.abn}</Text>
            <Text>{organization.address.line1}</Text>
            <Text>{organization.address.line2}</Text>
            <Text>{organization.address.city} {organization.address.postcode}</Text>
            <Text>{organization.email}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.purchaser.name}</Text>
            {data.purchaser.organisation && (
              <Text>{data.purchaser.organisation}</Text>
            )}
            {data.purchaser.abn && <Text>ABN: {data.purchaser.abn}</Text>}
            <Text>{data.purchaser.email}</Text>
            {data.poNumber && (
              <Text style={{ marginTop: 5 }}>PO Number: {data.poNumber}</Text>
            )}
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Event:</Text>
            <Text style={styles.value}>Australian AI Safety Forum {year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dates:</Text>
            <Text style={styles.value}>{datesLong}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{venueLong}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>
            {data.lineItems.map((item) => (
              <View key={`${item.description}-${item.quantity}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnitPrice]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (ex. GST):</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal - data.gstAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST (10%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.gstAmount)}</Text>
          </View>
          {data.discountAmount && data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount{data.discountDescription ? ` (${data.discountDescription})` : ''}:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(data.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total (AUD):</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.bankDetails}>
          <Text style={styles.bankTitle}>Payment Details - Bank Transfer</Text>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Account Name:</Text>
            <Text style={styles.bankValue}>{organization.bankDetails.accountName}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>BSB:</Text>
            <Text style={styles.bankValue}>{organization.bankDetails.bsb}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Account Number:</Text>
            <Text style={styles.bankValue}>{organization.bankDetails.accountNumber}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Bank:</Text>
            <Text style={styles.bankValue}>{organization.bankDetails.bank}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Reference:</Text>
            <Text style={styles.bankValue}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Due Notice */}
        <View style={styles.dueNotice}>
          <Text style={styles.dueNoticeText}>
            Payment due by {formatDate(data.dueDate)}. Please use invoice number as payment reference.
          </Text>
        </View>

        {/* Attendees List */}
        {data.attendees.length > 0 && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Registered Attendees ({data.attendees.length})</Text>
            <View style={styles.attendeesList}>
              {data.attendees.map((attendee) => (
                <View key={attendee.email} style={styles.attendee}>
                  <Text style={styles.attendeeName}>{attendee.name}</Text>
                  <Text style={styles.attendeeEmail}>{attendee.email}</Text>
                  <Text style={styles.attendeeTicket}>{attendee.ticketType}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{organization.name} | ABN {organization.abn}</Text>
          <Text>{organization.address.line1}, {organization.address.city} {organization.address.postcode}, {organization.address.country}</Text>
          <Text>{organization.email} | {organization.website}</Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate a PDF invoice buffer
 */
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
  return Buffer.from(buffer);
}

/**
 * Generate invoice number in format: AISF26-NNNN
 */
export async function generateInvoiceNumber(prisma: { order: { count: (args: { where: { invoiceNumber: { not: null } } }) => Promise<number> } }): Promise<string> {
  const count = await prisma.order.count({
    where: {
      invoiceNumber: { not: null },
    },
  });
  const nextNumber = count + 1;
  return `AISF26-${String(nextNumber).padStart(4, '0')}`;
}
