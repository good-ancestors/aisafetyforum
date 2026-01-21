'use client';

import { AuthView, NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';
import { useParams } from 'next/navigation';

export default function AuthPage() {
  const params = useParams();
  const pathname = params.path as string;

  return (
    <div className="min-h-screen bg-[--bg-cream] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-[--navy]">
            Australian AI Safety Forum
          </h1>
          <p className="text-[--text-muted] mt-2">
            {pathname === 'sign-in' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        <NeonAuthUIProvider authClient={authClient}>
          <AuthView pathname={pathname} />
        </NeonAuthUIProvider>
      </div>
    </div>
  );
}
