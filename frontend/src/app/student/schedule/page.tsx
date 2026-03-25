'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function ScheduleContent() {
  return (
    <DashboardLayout userName="Schedule">
      <section className="rounded-2xl border border-[#e7e9f0] bg-white p-8">
        <h2 className="text-[32px] font-extrabold tracking-[-0.03em] text-[#303546]">Schedule page is ready for integration</h2>
        <p className="mt-2 text-[18px] text-[#6e768b]">
          This section has been scaffolded so sidebar navigation is fully working.
        </p>
      </section>
    </DashboardLayout>
  );
}

export default function SchedulePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ScheduleContent />
    </ProtectedRoute>
  );
}
