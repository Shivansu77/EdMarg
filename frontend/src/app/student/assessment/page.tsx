'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function StudentAssessmentContent() {
  const router = useRouter();

  useEffect(() => {
    router.push('/student/assessments');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to assessments...</p>
    </div>
  );
}

export default function StudentAssessmentPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentAssessmentContent />
    </ProtectedRoute>
  );
}
