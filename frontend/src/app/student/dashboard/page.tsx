/* eslint-disable @typescript-eslint/no-unused-vars */
 
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CalendarSyncButton from '@/components/CalendarSyncButton';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
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
  Film
} from 'lucide-react';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
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
        // Opportunistically process pending Zoom recordings so newly-finished
        // sessions get uploaded to Cloudinary even if webhook background work
        // was interrupted on serverless.
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
      <DashboardLayout userName="Student Dashboard">
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
  
  // Find highest priority pending assignment
  const pendingAssignments = assignments.filter(a => a.isActive /* might need active check based on your data structure */);

  // Derive stats dynamically
  const completedAssessmentsCount = 0; // Replace with actual completed logic if available directly
  
  const stats = [
    { label: 'Assessments', value: pendingAssignments.length > 0 ? pendingAssignments.length : '0', sub: 'pending', trend: 'Take now' },
    { label: 'Upcoming', value: upcomingBookings.length, sub: 'sessions', trend: upcomingBookings.length > 0 ? 'Next soon' : 'Schedule one' },
    { label: 'Mentors met', value: pastBookings.length, sub: 'completed sessions', trend: 'Growing network' },
    { label: 'Status', value: user?.profileComplete ? 'Complete' : 'Active', sub: 'profile', trend: 'On track' },
  ];

  return (
    <DashboardLayout userName={user?.name ? `${user.name}'s Dashboard` : "Student Dashboard"}>
      <div className="min-h-dvh pb-16">
        
        {/* Dynamic Header */}
        <div className="relative overflow-hidden border-b border-white/60 bg-white/40 backdrop-blur-3xl px-6 pb-12 pt-10 sm:px-12">
          <div className="absolute -top-32 -right-32 h-[40rem] w-[40rem] rounded-full bg-emerald-200/20 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 -left-32 h-[30rem] w-[30rem] rounded-full bg-cyan-100/30 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-8">
              Student Workspace
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl max-w-4xl">
              Welcome back, <span className="text-emerald-600">{user?.name?.split(' ')[0] || 'Student'}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-slate-600 font-medium leading-relaxed">
              {upcomingBookings.length > 0 
                ? "Your journey is picking up speed. You have upcoming sessions to prepare for."
                : pendingAssignments.length > 0 
                  ? "Take your pending assessments to unlock a more personalized experience."
                  : "Start your professional transformation by exploring our world-class mentor network."}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {pendingAssignments.length > 0 && (
                <Link
                  href={`/student/assessments/${pendingAssignments[0]._id}`}
                  className="group relative inline-flex h-14 items-center gap-3 rounded-2xl bg-emerald-500 px-8 text-base font-bold text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-0.5 active:scale-95"
                >
                  Continue Assessment <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link
                href="/student/mentors"
                className="inline-flex h-14 items-center gap-3 rounded-2xl bg-slate-950 px-8 text-base font-bold text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
              >
                Browse Mentors
              </Link>
              <Link
                href="/student/assessments"
                className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl px-8 text-base font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
              >
                Take New Assessment
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 pt-8 sm:px-8 max-w-6xl mx-auto">
          
          {/* Stats Glassmorphic Board */}
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group relative px-6 py-6 transition-colors hover:bg-white/50 ${i < stats.length - 1 ? 'border-r border-white/30' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <Label>{s.label}</Label>
                  <Activity size={16} className="text-gray-300 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                  {s.value}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 font-medium">
                  {s.sub}
                </p>
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-linear-to-r from-emerald-400 to-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Main 2-col */}
          <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
            
            {/* Left Content Area: Sessions and Action Items */}
            <div className="space-y-8">
              
              {/* Action Items / Assessments */}
              <Card>
                <div className="border-b border-white/30 px-6 py-6 bg-white/30">
                  <Label>Required Action</Label>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    Pending Assessments
                  </h2>
                </div>

                <div className="p-6">
                  {pendingAssignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Sparkles className="w-12 h-12 text-emerald-400 mb-4 opacity-50" />
                      <p className="text-gray-900 font-semibold mb-1">All caught up!</p>
                      <p className="text-gray-500 text-sm">You have no pending assessments to complete.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/20">
                      {pendingAssignments.map((assignment: any) => (
                        <li key={assignment._id} className="group flex items-start gap-4 py-4 transition-colors hover:bg-white/40 -mx-6 px-6">
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <FileText size={18} className="text-emerald-500" />
                              {assignment.template?.title || 'Assessment'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 limit-lines-2">{assignment.template?.description || 'Please complete to proceed.'}</p>
                          </div>
                          <Link
                            href={`/student/assessments/${assignment._id}`}
                            className="shrink-0 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                          >
                            Start
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              <Card>
                <div className="border-b border-white/30 px-6 py-6 bg-white/30">
                  <Label>Library</Label>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900">Session Recordings</h2>
                </div>

                <div className="p-6">
                  {recordingSessions.length === 0 ? (
                    <div className="text-center py-6">
                      <Film className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Your recordings will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{recordingSessions.length}</span>{' '}
                        recording{recordingSessions.length > 1 ? 's' : ''} available.
                      </p>
                      <Link
                        href="/student/recordings"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600"
                      >
                        Open Recordings
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* Right Sidebar Area: Timeline / Upcoming */}
            <div className="space-y-8">
              
              <Card>
                <div className="border-b border-white/30 px-6 py-6 bg-white/30">
                  <Label>Timeline</Label>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900">Upcoming Sessions</h2>
                </div>
                
                <div className="p-6">
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No scheduled sessions.</p>
                      <Link href="/student/mentors" className="mt-3 inline-block text-emerald-600 font-bold text-sm hover:underline">
                        Book a mentor
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {upcomingBookings.map((booking: any) => (
                        <div key={booking._id} className="relative flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                            <div className="w-px h-full bg-gray-100 mt-2"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-semibold text-slate-900">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</p>
                            <p className="text-sm font-bold text-emerald-600 mt-0.5">
                              {booking.startTime} {booking.endTime ? `- ${booking.endTime}` : ''}
                              <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {booking.status}
                              </span>
                            </p>
                            <p className="text-sm text-slate-500 mt-1">with {booking.mentor?.name || 'Mentor'}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {booking.meetingLink && (
                                <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="inline-flex text-xs font-bold text-emerald-600 hover:text-emerald-800 tracking-wide uppercase bg-emerald-50 px-3 py-1 rounded w-fit">
                                  Join Meeting
                                </a>
                              )}
                              <CalendarSyncButton booking={booking} userRole="student" />
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
