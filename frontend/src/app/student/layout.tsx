'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultAuthenticatedPath } from '@/utils/auth-profile';

const PROTECTED_ROUTES = [
  '/student/dashboard',
  '/student/assessment',
  '/student/assessments',
  '/student/booking',
  '/student/schedule',
  '/student/history',
  '/student/profile',
  '/student/results',
  '/student/recordings',
  '/student/mentors',
];

const emptySubscribe = () => () => undefined;

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { isLoaded: isClerkLoaded } = useClerkUser();
  const hasHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isProtectedRoute = useMemo(
    () => PROTECTED_ROUTES.some((route) => pathname.startsWith(route)),
    [pathname]
  );
  const isAuthorized = !isProtectedRoute || user?.role === 'student';

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (isProtectedRoute && (!isClerkLoaded || isLoading)) {
      return;
    }

    if (isProtectedRoute && user?.role !== 'student') {
      router.replace(user ? getDefaultAuthenticatedPath(user) : '/login');
    }
  }, [hasHydrated, isClerkLoaded, isLoading, isProtectedRoute, router, user]);

  if (!hasHydrated || (isProtectedRoute && (!isClerkLoaded || isLoading)) || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
