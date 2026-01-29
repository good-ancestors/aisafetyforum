import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/server';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const admin = await isAdmin(user.email);
  return NextResponse.json({ isAdmin: admin });
}
