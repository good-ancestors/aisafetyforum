import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  const admin = await isAdmin(user.email);

  // Fetch profile for avatar and name
  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { name: true, avatarUrl: true },
  });

  return NextResponse.json({
    isAdmin: admin,
    profile: profile ? { name: profile.name, avatarUrl: profile.avatarUrl } : null,
  });
}
