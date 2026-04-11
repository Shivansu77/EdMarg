'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'admin') router.replace('/admin/dashboard');
      else if (user?.role === 'mentor') router.replace('/mentor/dashboard');
      else if (user?.role === 'student') router.replace('/student/dashboard');
      else router.replace('/login');
    }
  }, [user, isLoading, router]);
  
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">Loading your dashboard...</p>
      </div>
    </div>
  );
}
