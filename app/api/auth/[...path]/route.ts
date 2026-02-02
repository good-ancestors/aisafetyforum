import { auth } from '@/lib/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth API handler.
 *
 * This replaces the Neon Auth handler with direct Better Auth integration.
 * All auth endpoints are handled by Better Auth:
 * - /api/auth/email-otp/send-verification-otp
 * - /api/auth/email-otp/verify-otp
 * - /api/auth/get-session
 * - /api/auth/sign-out
 * etc.
 */
export const { GET, POST } = toNextJsHandler(auth);
