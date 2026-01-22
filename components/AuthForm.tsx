'use client';

import { useRef, useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function AuthForm({ onSuccess, redirectTo = '/' }: AuthFormProps) {
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });

      if (result.error) {
        setError(result.error.message || 'Failed to send code');
      } else {
        setStep('otp');
        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode(code: string) {
    setError('');
    setIsLoading(true);

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp: code,
      });

      if (result.error) {
        setError(result.error.message || 'Invalid code');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        if (onSuccess) {
          onSuccess();
        }
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyCode(pastedData);
    }
  }

  async function handleResendCode() {
    setError('');
    setIsLoading(true);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      setError(''); // Clear any existing error
    } catch {
      setError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <>
        <div className="text-center mb-6">
          <h2 className="font-serif text-xl font-bold text-[#0a1f5c]">
            Sign in or create account
          </h2>
          <p className="text-[#5c6670] text-sm mt-1">
            Enter your email to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSendCode}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full px-3 py-2.5 border border-[#e0e4e8] rounded-lg text-[#1a1a1a] placeholder:text-[#a8b0b8] focus:outline-none focus:ring-2 focus:ring-[#0047ba] focus:border-transparent transition-shadow"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-2.5 px-4 bg-[#0a1f5c] text-white font-semibold rounded-lg hover:bg-[#061440] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send code'}
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="font-serif text-xl font-bold text-[#0a1f5c]">
          Check your email
        </h2>
        <p className="text-[#5c6670] text-sm mt-1">
          We sent a 6-digit code to<br />
          <span className="font-medium text-[#1a1a1a]">{email}</span>
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#1a1a1a] mb-3 text-center">
          Enter verification code
        </label>
        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { otpRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              disabled={isLoading}
              className="w-11 h-12 text-center text-lg font-semibold border border-[#e0e4e8] rounded-lg text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0047ba] focus:border-transparent transition-shadow disabled:opacity-50"
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      <button
        onClick={() => handleVerifyCode(otp.join(''))}
        disabled={isLoading || otp.join('').length !== 6}
        className="w-full py-2.5 px-4 bg-[#0a1f5c] text-white font-semibold rounded-lg hover:bg-[#061440] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
      >
        {isLoading ? 'Verifying...' : 'Verify code'}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-[#0047ba] hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
        <span className="text-[#a8b0b8] mx-2">·</span>
        <button
          type="button"
          onClick={() => {
            setStep('email');
            setOtp(['', '', '', '', '', '']);
            setError('');
          }}
          disabled={isLoading}
          className="text-[#0047ba] hover:underline disabled:opacity-50"
        >
          Use different email
        </button>
      </div>
    </>
  );
}
