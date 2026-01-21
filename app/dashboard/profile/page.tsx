import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import DeleteAccountSection from './DeleteAccountSection';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
  });

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[--navy] mb-2">
        Edit Profile
      </h1>
      <p className="text-[--text-muted] mb-8">
        Update your information. This will be used across your applications and registrations.
      </p>

      <ProfileForm
        email={user.email}
        initialData={profile ? {
          name: profile.name || '',
          title: profile.title || '',
          organisation: profile.organisation || '',
          bio: profile.bio || '',
          linkedin: profile.linkedin || '',
          twitter: profile.twitter || '',
          bluesky: profile.bluesky || '',
          website: profile.website || '',
        } : undefined}
      />

      <div className="mt-12">
        <DeleteAccountSection />
      </div>
    </main>
  );
}
