import { isAdmin } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/server';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const user = await getCurrentUser();
  const userIsAdmin = user ? await isAdmin(user.email) : false;

  return (
    <HeaderClient
      user={user ? { email: user.email } : null}
      isAdmin={userIsAdmin}
    />
  );
}
