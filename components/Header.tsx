import HeaderClient from './HeaderClient';

interface UserProfile {
  name: string | null;
  avatarUrl: string | null;
}

/**
 * Props for server-side data passing.
 * When provided, HeaderClient skips the client-side /api/auth/me fetch.
 * This improves performance on pages that already have auth data (e.g., dashboard).
 */
interface HeaderProps {
  initialUserEmail?: string | null;
  initialProfile?: UserProfile | null;
  initialIsAdmin?: boolean;
}

export default function Header({
  initialUserEmail,
  initialProfile,
  initialIsAdmin,
}: HeaderProps = {}) {
  return (
    <HeaderClient
      initialUserEmail={initialUserEmail}
      initialProfile={initialProfile}
      initialIsAdmin={initialIsAdmin}
    />
  );
}
