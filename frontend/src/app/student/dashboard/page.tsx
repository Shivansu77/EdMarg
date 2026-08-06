'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import RecommendedMentors from '@/components/RecommendedMentors';
import {
  ArrowRight,
  CalendarDays,
  Users,
  Loader2,
  Video,
  ClipboardCheck,
} from 'lucide-react';

interface StudentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignmentItem {
  _id: string;
  title: string;
  isActive?: boolean;
}

interface BookingItem {
  _id: string;
  date: string;
  status: string;
  recordingUrl?: string;
}

function StudentDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, assignmentsRes, bookingsRes] = await Promise.all([
          apiClient.get<StudentUser>('/api/v1/users/me'),
          apiClient.get<AssignmentItem[] | { assignments: AssignmentItem[] }>('/api/v1/assessments/assignments/my'),
          apiClient.get<BookingItem[] | { bookings: BookingItem[] }>('/api/v1/bookings/my-bookings'),
        ]);

        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        }

        if (assignmentsRes.success && assignmentsRes.data) {
          const assignmentList = Array.isArray(assignmentsRes.data)
            ? assignmentsRes.data
            : (assignmentsRes.data as { assignments: AssignmentItem[] }).assignments || [];
          setAssignments(assignmentList);
        }

        if (bookingsRes.success && bookingsRes.data) {
          const bookingList = Array.isArray(bookingsRes.data)
            ? bookingsRes.data
            : (bookingsRes.data as { bookings: BookingItem[] }).bookings || [];
          setBookings(bookingList);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userName="Student Workspace">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings
    .filter((b) => {
      const bDate = new Date(b.date);
      bDate.setHours(0, 0, 0, 0);
      return ['pending', 'confirmed', 'in-progress'].includes(b.status) && bDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.date) < today
  );
  const recordingSessions = bookings.filter((b) => Boolean(b.recordingUrl));
  const pendingAssignments = assignments.filter((a) => a.isActive !== false);

  const stats = [
    {
      label: 'Pending Tasks',
      value: pendingAssignments.length,
      sub: 'assessments to complete',
      icon: ClipboardCheck,
    },
    {
      label: 'Upcoming',
      value: upcomingBookings.length,
      sub: 'scheduled sessions',
      icon: CalendarDays,
    },
    {
      label: 'Sessions Done',
      value: pastBookings.length,
      sub: 'completed sessions',
      icon: Users,
    },
    {
      label: 'Recordings',
      value: recordingSessions.length,
      sub: 'saved in library',
      icon: Video,
    },
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <DashboardLayout userName={`${firstName}'s Workspace`}>
      <div className="space-y-8 pb-12">
        {/* Minimalist Hero */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Overview
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 text-base text-slate-600 leading-relaxed">
              Accelerate your career with 1-on-1 mentorship, skill assessments, and personalized guidance.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/student/mentors"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Find a Mentor <ArrowRight size={16} />
              </Link>
              <Link
                href="/student/schedule"
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Minimalist Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </span>
                  <Icon size={18} className="text-slate-400" />
                </div>
                <p className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">
                  {s.value}
                </p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Recommendation Section */}
        <div>
          <RecommendedMentors variant="dashboard" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
