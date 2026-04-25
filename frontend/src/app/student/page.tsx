'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultAuthenticatedPath } from '@/utils/auth-profile';

export default function StudentRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'student') {
        router.replace(getDefaultAuthenticatedPath(user));
        return;
      }

      router.replace('/login');
    }
  }, [user, isLoading, router]);
  
  return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">Redirecting to Dashboard...</div>;
}
