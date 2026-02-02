import {
  getAllSpeakerProposals,
  getAllScholarshipApplications,
  getApplicationStats,
} from '@/lib/admin-actions';
import ApplicationsTabs from './ApplicationsTabs';

export default async function AdminApplicationsPage() {
  const [speakerProposals, scholarshipApplications, stats] = await Promise.all([
    getAllSpeakerProposals(),
    getAllScholarshipApplications(),
    getApplicationStats(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy mb-2">
        All Applications
      </h1>
      <p className="text-muted mb-8">
        Review and manage speaker proposals and scholarship applications.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Speaker Proposals</p>
          <p className="text-2xl font-bold text-navy">{stats.speaker.total}</p>
          <p className="text-xs text-muted mt-1">
            {stats.speaker.pending} pending · {stats.speaker.accepted} accepted
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Scholarships</p>
          <p className="text-2xl font-bold text-navy">{stats.scholarship.total}</p>
          <p className="text-xs text-muted mt-1">
            {stats.scholarship.pending} pending · {stats.scholarship.approved} approved
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600">
            {stats.speaker.pending + stats.scholarship.pending}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-sm text-muted">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.speaker.rejected + stats.scholarship.rejected}
          </p>
        </div>
      </div>

      {/* Applications Tabs */}
      <ApplicationsTabs
        speakerProposals={speakerProposals.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          organisation: p.organisation,
          title: p.title,
          format: p.format,
          abstract: p.abstract,
          travelSupport: p.travelSupport,
          anythingElse: p.anythingElse,
          status: p.status,
          createdAt: p.createdAt,
          profile: p.profile
            ? {
                id: p.profile.id,
                name: p.profile.name,
                email: p.profile.email,
                title: p.profile.title,
                organisation: p.profile.organisation,
              }
            : null,
        }))}
        scholarshipApplications={scholarshipApplications.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          organisation: a.organisation,
          role: a.role,
          amount: a.amount,
          whyAttend: a.whyAttend,
          backgroundInfo: a.backgroundInfo,
          travelSupport: a.travelSupport,
          status: a.status,
          createdAt: a.createdAt,
          profile: a.profile
            ? {
                id: a.profile.id,
                name: a.profile.name,
                email: a.profile.email,
                title: a.profile.title,
                organisation: a.profile.organisation,
              }
            : null,
        }))}
      />
    </main>
  );
}
