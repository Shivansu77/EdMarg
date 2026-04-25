'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDefaultAuthenticatedPath, isProfileComplete } from '@/utils/auth-profile';

export default function SessionRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      if (!isProfileComplete(user) || user.role === 'admin') {
        router.replace(getDefaultAuthenticatedPath(user));
        return;
      }

      if (user.role === 'mentor') {
        router.replace('/mentor/sessions');
        return;
      }

      if (user.role === 'student') {
        router.replace('/student/schedule');
        return;
      }

      router.replace('/login');
    }
  }, [user, isLoading, router]);
  
  return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">Redirecting to your sessions...</div>;
}
