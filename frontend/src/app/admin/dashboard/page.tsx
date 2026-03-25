'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BriefcaseBusiness, GraduationCap, ShieldCheck, UserCog } from 'lucide-react';

const adminStats = [
  { label: 'Students Active', value: '1,284', icon: GraduationCap },
  { label: 'Mentors Verified', value: '96', icon: ShieldCheck },
  { label: 'Career Tracks', value: '38', icon: BriefcaseBusiness },
  { label: 'Admins Online', value: '07', icon: UserCog },
];

function AdminDashboardContent() {
  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-10 pb-10">
        <section className="rounded-[1.5rem] p-8 md:p-10 text-on-primary bg-[linear-gradient(135deg,#4e45e2_0%,#6e3bd8_100%)]">
          <p className="text-xs uppercase tracking-[0.2em] text-on-primary/80 font-semibold">Admin Mode</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-manrope font-extrabold tracking-[-0.02em]">Operational clarity at a glance.</h1>
          <p className="mt-4 max-w-3xl text-on-primary/85 text-base md:text-lg font-inter">
            Monitor mentor quality, student growth, and platform health through tonal layers built for high-density review.
          </p>
        </section>

        <section className="bg-surface-container-low rounded-[1.5rem] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {adminStats.map((stat) => (
              <article key={stat.label} className="rounded-[1.5rem] p-6 bg-surface-container-lowest space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-tertiary">
                  <stat.icon size={22} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-on-surface-variant font-semibold">{stat.label}</p>
                <h2 className="text-3xl font-manrope font-extrabold tracking-[-0.02em]">{stat.value}</h2>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
