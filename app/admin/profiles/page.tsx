import { getAllProfiles, getProfileStats, getAllAuthUsers, getAuthUserStats } from '@/lib/admin-actions';
import ProfileList from './ProfileList';
import AuthUserList from './AuthUserList';

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view || 'profiles';

  const [profiles, profileStats, authUsers, authStats] = await Promise.all([
    getAllProfiles(),
    getProfileStats(),
    getAllAuthUsers(),
    getAuthUserStats(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Users
      </h1>
      <p className="text-[--text-muted] mb-8">
        Manage user profiles and admin access.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Auth Users</p>
          <p className="text-2xl font-bold text-[--navy]">{authStats.totalAuthUsers}</p>
          <p className="text-xs text-[--text-muted]">Signed up</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">With Profiles</p>
          <p className="text-2xl font-bold text-[--blue]">{authStats.profilesLinked}</p>
          <p className="text-xs text-[--text-muted]">Completed profile</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{authStats.admins}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">With Tickets</p>
          <p className="text-2xl font-bold text-green-600">{profileStats.withTickets}</p>
        </div>
        <div className="bg-white rounded-lg border border-[--border] p-4">
          <p className="text-sm text-[--text-muted]">With Applications</p>
          <p className="text-2xl font-bold text-[--teal]">{profileStats.withApplications}</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <a
          href="?view=auth"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'auth'
              ? 'bg-[--navy] text-white'
              : 'bg-white border border-[--border] text-[--text-body] hover:bg-[--bg-light]'
          }`}
        >
          All Auth Users ({authStats.totalAuthUsers})
        </a>
        <a
          href="?view=profiles"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'profiles'
              ? 'bg-[--navy] text-white'
              : 'bg-white border border-[--border] text-[--text-body] hover:bg-[--bg-light]'
          }`}
        >
          Profiles Only ({profileStats.total})
        </a>
      </div>

      {view === 'auth' ? (
        <>
          <p className="text-sm text-[--text-muted] mb-4">
            Shows everyone who has signed up, even if they haven&apos;t completed their profile yet.
            You can grant admin access to users before they fill out their profile.
          </p>
          <AuthUserList
            authUsers={authUsers.map((u) => ({
              id: u.id,
              email: u.email,
              name: u.name,
              emailVerified: u.emailVerified,
              createdAt: u.createdAt,
              hasProfile: !!u.profile,
              isAdmin: u.profile?.isAdmin ?? false,
              organisation: u.profile?.organisation ?? null,
              title: u.profile?.title ?? null,
              ticketCount: u.profile?._count.registrations ?? 0,
              speakerProposalCount: u.profile?._count.speakerProposals ?? 0,
              scholarshipCount: u.profile?._count.fundingApplications ?? 0,
            }))}
          />
        </>
      ) : (
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
      )}
    </main>
  );
}
