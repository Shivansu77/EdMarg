'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'student' | 'mentor' | 'admin';
}

const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';
const emptySubscribe = () => () => undefined;

const resolveApiBaseUrl = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000';

  return baseUrl.replace(/\/$/, '');
};

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
  const hasHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isAuthorized = Boolean(user && user.role === requiredRole);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user || user.role !== requiredRole) {
      router.replace('/login');
    }
  }, [hasHydrated, requiredRole, router, user]);

  useEffect(() => {
    if (!hasHydrated || !isAuthorized) {
      return;
    }

    const controller = new AbortController();

    const verifySession = async () => {
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
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      }
    };

    void verifySession();

    return () => {
      controller.abort();
    };
  }, [hasHydrated, isAuthorized, requiredRole, router]);

  if (!hasHydrated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
