'use client';

import Image from 'next/image';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Simple header with logo */}
      <header className="p-4 sm:p-6">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="AI Safety Forum Australia"
            width={200}
            height={100}
            className="h-[40px] w-auto"
            priority
          />
        </Link>
      </header>

      {/* Centered auth form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
          <AuthForm redirectTo="/dashboard" />
        </div>
      </main>
    </div>
  );
}
