'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultAuthenticatedPath } from '@/utils/auth-profile';
import AuthRecovery from '@/components/common/AuthRecovery';

export default function AdminRedirect() {
  const router = useRouter();
  const { user, isLoading, isSignedIn, profileError, refreshUser } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !(isSignedIn && !user)) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user) {
        router.replace(getDefaultAuthenticatedPath(user));
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, isSignedIn, router]);

  if (!isLoading && isSignedIn && !user) {
    return <AuthRecovery message={profileError} onRetry={refreshUser} />;
  }
  
  return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">Redirecting to Admin Dashboard...</div>;
}
