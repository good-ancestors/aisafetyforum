import { getAllProfiles, getProfileStats } from '@/lib/admin-actions';
import ProfileList from './ProfileList';

export default async function AdminProfilesPage() {
  const [profiles, stats] = await Promise.all([getAllProfiles(), getProfileStats()]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Users
      </h1>
      <p className="text-[--text-muted] mb-8">
        Manage user profiles and admin access.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Total Users</p>
          <p className="text-2xl font-bold text-[--navy]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">With Tickets</p>
          <p className="text-2xl font-bold text-green-600">{stats.withTickets}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">With Applications</p>
          <p className="text-2xl font-bold text-[--teal]">{stats.withApplications}</p>
        </div>
      </div>

      {/* Profile List */}
      <ProfileList
        profiles={profiles.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          title: p.title,
          organisation: p.organisation,
          isAdmin: p.isAdmin,
          createdAt: p.createdAt,
          ticketCount: p._count.registrations,
          speakerProposalCount: p._count.speakerProposals,
          scholarshipCount: p._count.fundingApplications,
        }))}
      />
    </main>
  );
}
