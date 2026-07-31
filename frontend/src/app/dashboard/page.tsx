'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultAuthenticatedPath } from '@/utils/auth-profile';
import AuthRecovery from '@/components/common/AuthRecovery';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading, isSignedIn, profileError, refreshUser } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !(isSignedIn && !user)) {
      router.replace(user ? getDefaultAuthenticatedPath(user) : '/login');
    }
  }, [user, isLoading, isSignedIn, router]);

  if (!isLoading && isSignedIn && !user) {
    return <AuthRecovery message={profileError} onRetry={refreshUser} />;
  }
  
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">Loading your dashboard...</p>
      </div>
    </div>
  );
}
