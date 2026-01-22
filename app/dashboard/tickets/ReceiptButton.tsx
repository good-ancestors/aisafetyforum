'use client';

interface ReceiptButtonProps {
  orderId: string;
}

export default function ReceiptButton({ orderId }: ReceiptButtonProps) {
  const handleDownload = () => {
    // Open the tax receipt PDF directly
    window.open(`/api/orders/${orderId}/receipt/pdf`, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0047ba] hover:text-[#0a1f5c] hover:bg-[#f0f4f8] rounded transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Receipt
    </button>
  );
}
