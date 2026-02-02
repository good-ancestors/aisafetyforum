import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false });
  }

  // Single query to get all needed profile data
  const profile = await prisma.profile.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { name: true, avatarUrl: true, isAdmin: true },
  });

  return NextResponse.json({
    isAdmin: profile?.isAdmin ?? false,
    profile: profile ? { name: profile.name, avatarUrl: profile.avatarUrl } : null,
  });
}
