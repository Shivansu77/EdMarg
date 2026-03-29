'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentOnboarding() {
  return (
    <ProtectedRoute requiredRole="student">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Onboarding Coming Soon</h1>
          <p className="text-gray-500">We are setting up your personalized experience.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
