'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user) {
        router.replace('/');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);
  
  return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-600">Redirecting to Admin Dashboard...</div>;
}
