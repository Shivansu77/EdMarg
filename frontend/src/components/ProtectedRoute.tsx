'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { resolveApiBaseUrl } from '@/utils/api-base';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'student' | 'mentor' | 'admin';
}

const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';
const emptySubscribe = () => () => undefined;

const clearStoredAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
};

export default function ProtectedRoute({
  children,
  requiredRole = 'student',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const hasHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isAuthorized = Boolean(user && user.role === requiredRole);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user || user.role !== requiredRole) {
      setIsSessionChecking(true);
      router.replace('/login');
    }
  }, [hasHydrated, requiredRole, router, user]);

  useEffect(() => {
    if (!hasHydrated || !isAuthorized) {
      return;
    }

    const controller = new AbortController();

    const verifySession = async () => {
      setIsSessionChecking(true);
      try {
        const response = await fetch(
          `${resolveApiBaseUrl()}/api/v1/users/me`,
          createAuthenticatedRequestInit({
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          })
        );

        const result = response.ok ? await response.json().catch(() => null) : null;
        const serverRole = result?.data?.role;
        const mentorApprovalStatus = result?.data?.mentorProfile?.approvalStatus || 'pending';

        if (!response.ok || serverRole !== requiredRole) {
          clearStoredAuth();
          router.replace('/login');
          return;
        }

        if (
          requiredRole === 'mentor' &&
          mentorApprovalStatus !== 'approved' &&
          pathname !== '/mentor/profile'
        ) {
          router.replace('/mentor/profile');
          return;
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSessionChecking(false);
        }
      }
    };

    void verifySession();

    return () => {
      controller.abort();
    };
  }, [hasHydrated, isAuthorized, pathname, requiredRole, router]);

  if (!hasHydrated || !isAuthorized || isSessionChecking) {
    const loadingMessage = !hasHydrated
      ? 'Preparing your session...'
      : isSessionChecking
        ? 'Verifying your session...'
        : 'Redirecting to login...';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-linear-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/30" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">{loadingMessage}</p>
            <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
