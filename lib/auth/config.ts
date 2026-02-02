import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { prisma } from '@/lib/prisma';
import { getBrevoClient } from '@/lib/brevo';
import { eventConfig } from '@/lib/config';
import * as brevo from '@getbrevo/brevo';

/**
 * Better Auth configuration.
 *
 * This replaces Neon Auth with direct Better Auth integration,
 * giving us full control over configuration including cookieCache
 * for better performance.
 *
 * Key features:
 * - Email OTP authentication (passwordless)
 * - Prisma adapter for database
 * - Cookie-based session caching to avoid DB hits on every request
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Secret for signing cookies/tokens - REQUIRED in production
  secret: process.env.BETTER_AUTH_SECRET,

  // Base URL for callbacks and redirects
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

  // Use the same base path as before
  basePath: '/api/auth',

  // Trusted origins for CORS
  trustedOrigins: [
    'http://localhost:3000',
    'https://aisafetyforum.vercel.app',
    'https://aisafetyforum.au',
  ],

  // Email authentication
  emailAndPassword: {
    enabled: false, // We use OTP only
  },

  // Session configuration with cookie caching
  session: {
    // Cookie-based session cache - avoids DB lookup on every request
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - session data cached in cookie
    },
    // Session expiration
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  // Plugins
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Send OTP via Brevo
        const apiInstance = getBrevoClient();
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Your verification code: ${otp}`;
        sendSmtpEmail.sender = {
          name: 'Australian AI Safety Forum',
          email: eventConfig.organization.email,
        };
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0a1f5c 0%, #0047ba 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { background: white; padding: 30px 20px; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0a1f5c; background: #f0f4f8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .footer { background: #0a1f5c; color: white; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sign In</h1>
      <p>Australian AI Safety Forum</p>
    </div>
    <div class="content">
      <p>Your verification code is:</p>
      <div class="code">${otp}</div>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>${eventConfig.organization.name}</p>
    </div>
  </div>
</body>
</html>
        `;
        sendSmtpEmail.textContent = `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ OTP email sent to ${email}`);
      },
      otpLength: 6,
      expiresIn: 10 * 60, // 10 minutes
    }),
  ],

});

// Export types for use in other files
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
