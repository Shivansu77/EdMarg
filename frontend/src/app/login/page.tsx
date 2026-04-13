'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath, getSafePostAuthPath } from '@/utils/auth-redirect';
import toast from 'react-hot-toast';

const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-emerald-50 via-green-50/40 to-white flex flex-col">
      {/* Layered background accents */}
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
