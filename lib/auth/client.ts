'use client';

import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

/**
 * Better Auth client for client-side authentication.
 *
 * Provides hooks and methods for:
 * - Email OTP authentication (sendVerificationOTP, verifyOTP)
 * - Session management (useSession, signOut)
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [emailOTPClient()],
});

// Export convenience hooks and methods
export const { useSession, signOut, signIn } = authClient;
