'use client';

export interface SpeakerProposalCardProps {
  id: string;
  format: string;
  abstract: string;
  status: string;
  createdAt: Date;
  actions?: React.ReactNode;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export default function SpeakerProposalCard({
  format,
  abstract,
  status,
  createdAt,
  actions,
}: SpeakerProposalCardProps) {
  return (
    <div className="border-l-4 border-blue bg-light p-4 rounded-r">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-navy">{format}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadgeClass(status)}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-muted line-clamp-2 mb-2">
            {abstract}
          </p>
          <p className="text-xs text-muted">
            Submitted {new Date(createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        {actions && (
          <div className="flex items-center ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
