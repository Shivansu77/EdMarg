'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
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
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
};

export default function ProtectedRoute({
  children,
  requiredRole = 'student',
}: ProtectedRouteProps) {
  const router = useRouter();
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

        if (!response.ok || serverRole !== requiredRole) {
          clearStoredAuth();
          router.replace('/login');
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
  }, [hasHydrated, isAuthorized, requiredRole, router]);

  if (!hasHydrated || !isAuthorized || isSessionChecking) {
    const loadingMessage = !hasHydrated
      ? 'Preparing your session...'
      : isSessionChecking
        ? 'Waking up the server...'
        : 'Redirecting to login...';

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-700">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
