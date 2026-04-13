'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
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

    if (isProtectedRoute && user?.role !== 'student') {
      router.replace('/login');
    }
  }, [hasHydrated, isProtectedRoute, router, user]);

  if (!hasHydrated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
