'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPostAuthFallbackPath, getSafePostAuthPath } from '@/utils/auth-redirect';
import { resolveApiBaseUrl, resolveBackendBaseUrl } from '@/utils/api-base';
import { validators } from '@/utils/validators';
import toast from 'react-hot-toast';

import Logo from '@/components/Logo';

const navigateAfterAuth = (
  router: ReturnType<typeof useRouter>,
  path: string
) => {
  if (typeof window === 'undefined') {
    router.replace(path);
    return;
  }

  window.location.replace(path);
};

const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const apiBaseUrl = resolveApiBaseUrl();
  const backendBaseUrl = resolveBackendBaseUrl();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(Boolean(searchParams.get('token')));
  const [error, setError] = useState<string>('');
  const redirectParam = searchParams.get('redirect') ?? searchParams.get('callbackUrl');

  useEffect(() => {
    if (!user) {
      return;
    }

    const fallbackPath = getPostAuthFallbackPath(user);
    navigateAfterAuth(router, getSafePostAuthPath(redirectParam, fallbackPath));
  }, [redirectParam, router, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validators.email(email)) {
      const message = 'Please enter a valid email address';
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    try {
      const authenticatedUser = await login(email, password);
      toast.success('Successfully logged in!');
      const fallbackPath = getPostAuthFallbackPath(authenticatedUser);
      navigateAfterAuth(router, getSafePostAuthPath(redirectParam, fallbackPath));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const state = encodeURIComponent(
      JSON.stringify({
        frontendOrigin: currentOrigin,
        redirectPath: redirectParam,
      })
    );

    if (clientId) {
      const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/v1/users/auth/google/callback`);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&prompt=select_account`;
      window.location.assign(authUrl);
    } else {
      window.location.assign(`${backendBaseUrl}/api/v1/users/auth/google?state=${state}`);
    }
  };

  // Handle OAuth callback token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      toast.error(errorParam);
      return;
    }

    if (token) {
      fetch(`${apiBaseUrl}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(result.data));
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
          
          window.dispatchEvent(new Event('edmarg-auth-user-change'));
          toast.success('Successfully logged in with Google!');
          const fallbackPath = getPostAuthFallbackPath(result.data);
          navigateAfterAuth(router, getSafePostAuthPath(redirectParam, fallbackPath));
        } else {
          toast.error(result.message || 'Failed to fetch user data for Google login');
        }
      })
      .catch(() => {
        toast.error('Failed to complete Google login callback request');
      })
      .finally(() => setLoading(false));
    }
  }, [apiBaseUrl, searchParams, router, redirectParam]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col">
      {/* Dynamic Background Accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-emerald-200/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-48 h-[50rem] w-[50rem] rounded-full bg-cyan-100/30 blur-[140px]" />
      </div>

      <div className="relative z-10 border-b border-white/60 bg-white/40 px-6 py-5 backdrop-blur-xl sm:px-12">
        <Logo />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_28px_70px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] backdrop-blur-3xl sm:p-9">
            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Authentication Required
              </div>
              <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[2rem]">
                Welcome back to <span className="text-emerald-600">EdMarg</span>
              </h1>
              <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">
                Log in to continue your professional growth journey and manage your bookings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group mb-7 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 active:scale-95"
            >
              <div className="relative h-7 w-7 shrink-0">
                <Image
                  src="/google-logo.png"
                  alt="Google"
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <span>Continue with Google</span>
            </button>

            <div className="relative mb-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.18em]">
                <span className="bg-white/10 px-4 font-semibold text-slate-400 backdrop-blur-sm">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={4}
                    className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl animate-shake">
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/60 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-emerald-600 transition-all decoration-2 underline-offset-4 hover:text-emerald-700 hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <p>&copy; {new Date().getFullYear()} EdMarg. Crafted for professional excellence.</p>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-emerald-500" /></div>}>
      <LoginContent />
    </React.Suspense>
  );
}
