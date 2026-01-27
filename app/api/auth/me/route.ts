import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { isAdmin } from '@/lib/auth/admin';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const admin = await isAdmin(user.email);
  return NextResponse.json({ isAdmin: admin });
}
