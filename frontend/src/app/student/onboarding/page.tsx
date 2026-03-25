'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    classLevel: '',
    interests: [],
  });

  const handleComplete = async () => {
    // Update user profile
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user._id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentProfile: formData,
      }),
    });

    if (response.ok) {
      router.push('/student/dashboard');
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      {/* Onboarding UI */}
    </ProtectedRoute>
  );
}
