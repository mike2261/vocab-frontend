'use client';

import { BookOpen, Loader2 } from 'lucide-react';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'email' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const { requestOTP, verifyOTP, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gsiReady, setGsiReady] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const loginWithGoogleRef = useRef(loginWithGoogle);
  loginWithGoogleRef.current = loginWithGoogle;

  // Mark GSI script as ready when it loads
  function handleGSILoad() {
    setGsiReady(true);
  }

  // Render button once both script is loaded and div is mounted
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GSI_CLIENT_ID;
    if (!gsiReady || !clientId || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        setError(null);
        setIsGoogleLoading(true);
        try {
          await loginWithGoogleRef.current(response.credential);
          router.replace('/dashboard');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Google sign-in failed');
          setIsGoogleLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: googleBtnRef.current.offsetWidth || 360,
      text: 'continue_with',
      locale: 'en',
    });
  }, [gsiReady, router]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await requestOTP(email);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await verifyOTP(email, code);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" onLoad={handleGSILoad} />

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <BookOpen size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-700 text-neutral-900 text-lg tracking-tight">Lexio</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mb-0.5" />
        </div>

        {step === 'email' ? (
          <>
            <h1 className="text-2xl font-700 text-neutral-900 mb-1">Welcome</h1>
            <p className="text-sm text-neutral-500 mb-6">Enter your email to get a sign-in code</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-500 text-neutral-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary-500 text-white font-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Sending…' : 'Send code'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <div ref={googleBtnRef} className="w-full">
              {isGoogleLoading && (
                <div className="w-full py-2.5 border border-neutral-300 rounded-lg flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-700 text-neutral-900 mb-1">Check your email</h1>
            <p className="text-sm text-neutral-500 mb-6">
              We sent a 6-digit code to <span className="font-500 text-neutral-700">{email}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-500 text-neutral-700 mb-1.5">
                  Login code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition tracking-widest text-center text-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-2.5 bg-primary-500 text-white font-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? 'Verifying…' : 'Verify'}
              </button>
            </form>

            <button
              onClick={() => { setStep('email'); setCode(''); setError(null); }}
              className="mt-4 w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              ← Use a different email
            </button>
          </>
        )}
      </div>
    </>
  );
}
