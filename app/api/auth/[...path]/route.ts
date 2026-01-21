import { NextResponse } from 'next/server';

// Defer auth handler import to runtime to avoid build failures
// when NEON_AUTH_BASE_URL is not set
async function getAuthHandler() {
  if (!process.env.NEON_AUTH_BASE_URL) {
    return null;
  }
  const { authApiHandler } = await import('@neondatabase/auth/next/server');
  return authApiHandler();
}

const notConfiguredResponse = () =>
  NextResponse.json(
    { error: 'Authentication not configured. Set NEON_AUTH_BASE_URL environment variable.' },
    { status: 503 }
  );

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const handler = await getAuthHandler();
  if (!handler) return notConfiguredResponse();
  return handler.GET(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const handler = await getAuthHandler();
  if (!handler) return notConfiguredResponse();
  return handler.POST(request, context);
}
