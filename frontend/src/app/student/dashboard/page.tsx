/* eslint-disable @typescript-eslint/no-unused-vars */
 
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CalendarSyncButton from '@/components/common/CalendarSyncButton';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import RecommendedMentors from '@/components/RecommendedMentors';
import GoalProgressWidget from '@/components/GoalProgressWidget';
import {
  ArrowRight,
  CalendarDays,
  Target,
  Users,
  Activity,
  FileText,
  Clock,
  Sparkles,
  Loader2,
  Film,
  Video,
  ClipboardCheck,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
      {children}
    </p>
  );
}

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
          <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your workspace...</p>
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
  
  const pendingAssignments = assignments.filter(a => a.isActive !== false); // Assume active unless explicitly false
  
  const stats = [
    { label: 'Pending Tasks', value: pendingAssignments.length, sub: 'assessments to complete', icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Upcoming', value: upcomingBookings.length, sub: 'scheduled sessions', icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Network', value: pastBookings.length, sub: 'completed sessions', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Recordings', value: recordingSessions.length, sub: 'saved in library', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <DashboardLayout userName={user?.name ? `${user.name.split(' ')[0]}'s Workspace` : "Student Workspace"}>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* ── Premium Hero Header ── */}
        <div className="relative overflow-hidden bg-white border-b border-slate-200 px-6 sm:px-12 py-16 lg:py-20">
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/40 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-100/40 blur-[100px]" />
          
          <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 mb-6">
                <LayoutGrid size={14} />
                Student Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Welcome back,<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0] || 'Student'}
                </span>.
              </h1>
              <p className="mt-6 text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                {upcomingBookings.length > 0 
                  ? "You have upcoming sessions scheduled. Prepare your notes and questions to make the most out of your mentorship."
                  : pendingAssignments.length > 0 
                    ? "You have pending assessments. Complete them to unlock highly personalized mentor recommendations."
                    : "Ready to accelerate your career? Explore our world-class mentor network and book your first session."}
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                {pendingAssignments.length > 0 ? (
                  <Link
                    href={`/student/assessments/${pendingAssignments[0]._id}`}
                    className="group inline-flex h-14 items-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
                  >
                    Resume Assessment <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href="/student/mentors"
                    className="group inline-flex h-14 items-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
                  >
                    Find a Mentor <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <Link
                  href="/student/schedule"
                  className="inline-flex h-14 items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:scale-95"
                >
                  View Schedule
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm min-w-[140px]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${s.bg} ${s.border} ${s.color}`}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 mb-1">{s.value}</p>
                    <p className="text-xs font-medium text-slate-500">{s.sub}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-6 pt-10 sm:px-12 max-w-[1200px] mx-auto space-y-10">
          
          {/* Recommendation Engine */}
          <RecommendedMentors variant="dashboard" />

          {/* Main 2-col Layout */}
          <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
            
            {/* ── Left Content Column ── */}
            <div className="space-y-10">
              
              {/* Action Items / Assessments */}
              <Card>
                <div className="border-b border-slate-100 px-8 py-6 flex items-center justify-between">
                  <div>
                    <Label>Tasks</Label>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      Pending Assessments
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                    <FileText size={20} />
                  </div>
                </div>

                <div className="p-8">
                  {pendingAssignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <Sparkles size={24} className="text-slate-300" />
                      </div>
                      <p className="text-lg text-slate-900 font-bold mb-1">All caught up!</p>
                      <p className="text-slate-500 text-sm max-w-sm">You have no pending assessments. Mentors will assign tasks here if needed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingAssignments.map((assignment: any) => (
                        <div key={assignment._id} className="group flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md bg-white">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ClipboardCheck size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-black transition-colors">
                              {assignment.template?.title || 'Assessment Task'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                              {assignment.template?.description || 'Please complete this task before your next session.'}
                            </p>
                          </div>
                          <Link
                            href={`/student/assessments/${assignment._id}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            Start Now
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Session Recordings Library */}
              <Card>
                <div className="border-b border-slate-100 px-8 py-6 flex items-center justify-between">
                  <div>
                    <Label>Library</Label>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      Recent Recordings
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Video size={20} />
                  </div>
                </div>

                <div className="p-8">
                  {recordingSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Film className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-slate-900 font-bold mb-1">No recordings yet</p>
                      <p className="text-slate-500 text-sm max-w-sm">Past video sessions will automatically appear here for you to review.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm overflow-hidden">
                           <Film size={20} className="z-10 relative" />
                           <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-transparent" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">Your Video Library</p>
                          <p className="text-sm font-medium text-slate-500">
                            {recordingSessions.length} session{recordingSessions.length > 1 ? 's' : ''} available to watch
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/student/recordings"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        Open Library
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* ── Right Sidebar Column ── */}
            <div className="space-y-10">
              
              {/* Goal Widget */}
              <GoalProgressWidget />
              
              {/* Upcoming Timeline */}
              <Card>
                <div className="border-b border-slate-100 px-6 py-6 flex items-center justify-between">
                  <div>
                    <Label>Timeline</Label>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Upcoming</h2>
                  </div>
                  <CalendarDays size={20} className="text-slate-400" />
                </div>
                
                <div className="p-6">
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <CalendarDays className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-900 font-bold mb-1">Schedule clear</p>
                      <p className="text-slate-500 text-sm mb-5">You have no upcoming sessions.</p>
                      <Link href="/student/mentors" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 shadow-sm w-full">
                        Book a mentor
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {upcomingBookings.map((booking: any) => (
                        <div key={booking._id} className="relative flex gap-4 group">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 group-hover:scale-110 transition-transform"></div>
                            <div className="w-[2px] h-full bg-slate-100 mt-2 rounded-full group-hover:bg-emerald-100 transition-colors"></div>
                          </div>
                          
                          <div className="flex-1 pb-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
                            </p>
                            
                            <div className="mt-2 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                                  {booking.mentor?.name || 'Mentor'}
                                </h4>
                                <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {booking.status}
                                </span>
                              </div>
                              
                              <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-400" />
                                {booking.startTime} {booking.endTime ? `- ${booking.endTime}` : ''}
                              </p>
                              
                              <div className="flex flex-col gap-2">
                                {booking.meetingLink && (
                                  <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-3 py-2 rounded-lg w-full">
                                    <Video size={14} />
                                    Join Meeting
                                  </a>
                                )}
                                <div className="w-full [&>button]:w-full [&>button]:justify-center">
                                  <CalendarSyncButton booking={booking} userRole="student" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </div>
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
