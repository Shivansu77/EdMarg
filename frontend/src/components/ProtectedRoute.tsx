'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'mentor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole = 'student' }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (requiredRole && userData.role !== requiredRole) {
        router.replace('/login');
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router, requiredRole]);

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
