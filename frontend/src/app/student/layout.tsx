'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/student/dashboard',
  '/student/assessment',
  '/student/booking',
  '/student/schedule',
  '/student/history',
  '/student/profile',
  '/student/results',
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
      // Protected route - require authentication
      if (!token || !user) {
        router.replace('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'student') {
          router.replace('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (e) {
        router.replace('/login');
      }
    } else {
      // Public route - no authentication required
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
