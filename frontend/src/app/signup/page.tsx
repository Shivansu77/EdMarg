'use client';

import React, { useEffect, useState } from 'react';
import { SignUp, useClerk } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { getPostAuthFallbackPath, getSafePostAuthPath } from '@/utils/auth-redirect';

const SignupContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clerk = useClerk();
  const { user } = useAuth();
  const redirectParam = searchParams.get('redirect') ?? searchParams.get('callbackUrl');
  const clerkRedirectPath = getSafePostAuthPath(redirectParam, '/complete-profile');
  const [clearing, setClearing] = useState(false);

  // Detect stuck #/continue state and auto-clear it
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('/continue') || hash.includes('/sso-callback')) {
      setClearing(true);

      const clearStuck = async () => {
        try {
          // Destroy the stuck sign-up session via Clerk client
          if (clerk?.client?.destroy) {
            await clerk.client.destroy();
          }
          if (clerk?.signOut) {
            await clerk.signOut({ redirectUrl: undefined });
          }
        } catch {
          // ignore
        }

        // Clear local storage
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}

        // Hard redirect to clean /signup URL (no hash)
        window.location.replace('/signup');
      };

      // Wait for Clerk to initialize, then clear
      setTimeout(clearStuck, 1500);
    }
  }, [clerk]);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!user) return;
    const fallbackPath = getPostAuthFallbackPath(user);
    router.replace(getSafePostAuthPath(redirectParam, fallbackPath));
  }, [redirectParam, router, user]);

  if (clearing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-4 text-sm text-slate-600">Clearing stuck session, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eefdf7_48%,#f8fafc_100%)]">
      <div className="relative z-10 border-b border-white/70 bg-white/50 px-6 py-5 backdrop-blur-xl sm:px-12">
        <Logo />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              EdMarg
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Create your account
            </h1>
          </div>

          <SignUp
            routing="hash"
            signInUrl="/login"
            forceRedirectUrl={clerkRedirectPath}
            fallbackRedirectUrl={clerkRedirectPath}
            appearance={{
              elements: {
                rootBox: 'mx-auto w-full',
                cardBox: 'mx-auto w-full shadow-2xl shadow-emerald-950/10',
                card: 'rounded-lg border border-white/70 bg-white/80 backdrop-blur-xl',
                footerActionLink: 'text-emerald-700 hover:text-emerald-800',
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
              },
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default function SignupPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <SignupContent />
    </React.Suspense>
  );
}
