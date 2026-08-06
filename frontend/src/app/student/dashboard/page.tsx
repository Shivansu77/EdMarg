/* eslint-disable @typescript-eslint/no-unused-vars */
 
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

function StudentDashboardContent() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Opportunistically process pending Zoom recordings
        await apiClient.get('/api/v1/zoom/process-pending?limit=2');

        const [userRes, assignmentsRes, bookingsRes] = await Promise.all([
          apiClient.get('/api/v1/users/me'),
          apiClient.get('/api/v1/assessments/assignments/my'),
          apiClient.get('/api/v1/bookings/my-bookings')
        ]);

        if (userRes.success) setUser(userRes.data);
        if (assignmentsRes.success) setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : ((assignmentsRes.data as any)?.assignments || []));
        if (bookingsRes.success) setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : ((bookingsRes.data as any)?.bookings || []));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userName="Workspace">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400 mb-4" />
          <p className="text-sm text-slate-600">Loading your workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings
    .filter(b => {
      const bDate = new Date(b.date);
      bDate.setHours(0, 0, 0, 0);
      return ['pending', 'confirmed', 'in-progress'].includes(b.status) && bDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastBookings = bookings.filter(b => b.status === 'completed' || new Date(b.date) < today);
  const recordingSessions = bookings.filter((b) => Boolean(b.recordingUrl));
  
  const pendingAssignments = assignments.filter(a => a.isActive !== false);
  
  const stats = [
    { label: 'Pending Tasks', value: pendingAssignments.length, sub: 'assessments to complete', icon: ClipboardCheck },
    { label: 'Upcoming', value: upcomingBookings.length, sub: 'scheduled sessions', icon: CalendarDays },
    { label: 'Network', value: pastBookings.length, sub: 'completed sessions', icon: Users },
    { label: 'Recordings', value: recordingSessions.length, sub: 'saved in library', icon: Video },
  ];

  return (
    <DashboardLayout userName={user?.name ? `${user.name.split(' ')[0]}'s Workspace` : "Student Workspace"}>
      <div className="min-h-screen bg-white">
        
        {/* Minimalist Hero Header */}
        <div className="border-b border-gray-200 px-6 sm:px-12 py-12">
          <div className="w-full max-w-[1200px] mx-auto">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
                Student Workspace
              </p>
              <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                Welcome back,{' '}
                <span className="text-emerald-600">
                  {user?.name?.split(' ')[0] || 'student'}
                </span>.
              </h1>
              <p className="text-base text-gray-600 max-w-2xl">
                Ready to accelerate your career? Explore our world-class mentor network and book your first session.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                href="/student/mentors"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Find a Mentor <ArrowRight size={16} />
              </Link>
              <Link
                href="/student/schedule"
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Schedule
              </Link>
            </div>

            {/* Minimalist Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon size={20} className="text-gray-400" />
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        {s.label}
                      </p>
                    </div>
                    <p className="text-3xl font-semibold text-gray-900 mb-1">{s.value}</p>
                    <p className="text-xs text-gray-600">{s.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-12 sm:px-12 max-w-[1200px] mx-auto">
          
          {/* Recommendation Engine */}
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
