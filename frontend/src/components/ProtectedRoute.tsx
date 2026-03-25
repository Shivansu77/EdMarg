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
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
          router.replace('/login');
          return;
        }

        const userData = JSON.parse(user);
        
        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
          return;
        }

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
    };

    verifyAuth();
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
