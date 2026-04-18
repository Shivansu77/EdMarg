'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath, getSafePostAuthPath } from '@/utils/auth-redirect';
import { resolveApiBaseUrl, resolveBackendBaseUrl } from '@/utils/api-base';
import toast from 'react-hot-toast';

const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const apiBaseUrl = resolveApiBaseUrl();
  const backendBaseUrl = resolveBackendBaseUrl();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const redirectParam = searchParams.get('redirect') ?? searchParams.get('callbackUrl');

  useEffect(() => {
    if (!user) {
      return;
    }

    const fallbackPath = getRoleDashboardPath(user.role);
    router.replace(getSafePostAuthPath(redirectParam, fallbackPath));
  }, [redirectParam, router, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authenticatedUser = await login(email, password);
      toast.success('Successfully logged in!');
      const fallbackPath = getRoleDashboardPath(authenticatedUser.role);
      router.replace(getSafePostAuthPath(redirectParam, fallbackPath));
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

    if (clientId) {
      const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/v1/users/auth/google/callback`);
      const state = encodeURIComponent(currentOrigin);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&prompt=select_account`;
      window.location.assign(authUrl);
    } else {
      // If we go to the backend first, we can append the origin as a query param if we wanted, 
      // but the backend's resolveFrontendBase(req) will now handle it via referer/origin headers
      window.location.assign(`${backendBaseUrl}/api/v1/users/auth/google`);
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
      // We have a token from Google redirect
      // AuthContext will need a way to verify this or we can just fetch /me
      setLoading(true);
      fetch(`${apiBaseUrl}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Persist and redirect
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(result.data));
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
          
          window.dispatchEvent(new Event('edmarg-auth-user-change'));
          toast.success('Successfully logged in with Google!');
          const fallbackPath = getRoleDashboardPath(result.data.role);
          router.replace(getSafePostAuthPath(redirectParam, fallbackPath));
        } else {
          toast.error(result.message || 'Failed to fetch user data for Google login');
        }
      })
      .catch((e) => {
        toast.error('Failed to complete Google login callback request');
      })
      .finally(() => setLoading(false));
    }
  }, [apiBaseUrl, searchParams, router, redirectParam]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-emerald-50 via-green-50/40 to-white flex flex-col">
      {/* ... (existing background) ... */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-emerald-200/55 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-100/60 blur-[100px]" />
      </div>

      <div className="relative z-10 px-6 py-4 border-b border-emerald-100/50 bg-white/70 backdrop-blur-md">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-300 to-green-400 text-sm font-extrabold text-slate-900 shadow-[0_10px_24px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5">
            E
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">EdMarg</span>
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_30px_70px_rgba(16,185,129,0.12)]">
            <div className="mb-8">
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-700 tracking-wide">
                Sign in to continue
              </p>
              <h1 className="mt-5 text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back</h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                Access your EdMarg dashboard, bookings, and mentor journey from one place.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-sm mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/85 px-2 text-slate-400 font-bold">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-linear-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-300 text-slate-900 font-bold rounded-xl transition-all duration-200 shadow-[0_12px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.35)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin text-slate-700" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <p className="text-center text-sm font-medium text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-6 text-center text-sm font-medium text-slate-500">
        <p>&copy; {new Date().getFullYear()} EdMarg. All rights reserved.</p>
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
