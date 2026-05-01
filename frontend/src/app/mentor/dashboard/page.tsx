 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import CalendarSyncButton from '@/components/CalendarSyncButton';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Target,
  Users,
  Activity,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  classLevel?: string;
}

interface Booking {
  _id: string;
  student: Student;
  date: string;
  startTime: string;
  endTime: string;
  sessionType?: string;
  status: string;
  meetingLink?: string;
  startUrl?: string;
  paymentStatus: string;
  amount: number;
}

interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

const statusCls: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-sm',
  confirmed: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 shadow-sm',
};

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function isPastDate(isoString: string) {
  try {
    const d = new Date(isoString);
    // Add 1 day to allow today to be upcoming (simple logic)
    return d.getTime() + 86400000 < Date.now();
  } catch {
    return true;
  }
}

function getBookingStart(booking: Booking) {
  const start = new Date(booking.date);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const [hours, minutes] = booking.startTime.split(':').map((value) => Number(value));
  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    start.setHours(hours, minutes, 0, 0);
  }

  return start;
}

function formatMeetingDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatMeetingTimeOnly(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">
      {children}
    </p>
  );
}

function MentorDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [recentHistory, setRecentHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const actionLockRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [meRes, statsRes, upcomingRes, pendingRes, historyRes] = await Promise.all([
          apiClient.get('/api/v1/users/me'),
          apiClient.get('/api/v1/mentor/bookings/stats'),
          apiClient.get('/api/v1/mentor/bookings/upcoming?limit=25'),
          apiClient.get('/api/v1/mentor/bookings?status=pending&limit=5'),
          apiClient.get('/api/v1/mentor/bookings?limit=5') // Get recent for history
        ]);

        if (meRes.data) setUser(meRes.data as User);
        if (statsRes.data) setStats(statsRes.data as BookingStats);
        
        // Filter strictly future for upcoming
        if (upcomingRes.data) {
           const allUpcoming = upcomingRes.data as Booking[];
           const strictlyUpcoming = allUpcoming.filter((b: Booking) => {
              const sessionStart = getBookingStart(b);
              if (!sessionStart || sessionStart < new Date()) return false;
              return b.status === 'confirmed' || b.status === 'in-progress';
           });
            strictlyUpcoming.sort((left, right) => {
             const leftStart = getBookingStart(left)?.getTime() || 0;
             const rightStart = getBookingStart(right)?.getTime() || 0;
             return leftStart - rightStart;
            });
            setUpcomingBookings(strictlyUpcoming);
        }

        if ((pendingRes.data as any)?.bookings) {
           setPendingRequests((pendingRes.data as any).bookings);
        }

        // For history
        if ((historyRes.data as any)?.bookings) {
            const allHistory = (historyRes.data as any).bookings;
            const pastOnly = allHistory.filter((b: Booking) => {
               return b.status === 'completed' || b.status === 'cancelled' || isPastDate(b.date);
            });
            setRecentHistory(pastOnly.slice(0, 5));
        }

      } catch (err) {
        console.error('Failed to load mentor dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const statItems = [
    { label: 'Total sessions', value: stats?.total?.toString() || '0', sub: 'all time', icon: Users },
    { label: 'Pending requests', value: stats?.pending?.toString() || '0', sub: 'awaiting response', icon: Target },
    { label: 'Confirmed', value: stats?.confirmed?.toString() || '0', sub: 'upcoming', icon: CalendarDays },
    { label: 'Completed', value: stats?.completed?.toString() || '0', sub: 'sessions finished', icon: Activity },
  ];
  const spotlightMeetings = upcomingBookings.slice(0, 2).filter((booking) => !!getBookingStart(booking));

  const handleStartSession = async (bookingId: string) => {
    if (actionLockRef.current.has(bookingId)) {
      return;
    }

    actionLockRef.current.add(bookingId);
    setActionLoadingId(bookingId);

    try {
      const response = await apiClient.put<{ startUrl?: string }>(`/api/v1/mentor/bookings/${bookingId}/start`);
      if (response.success && response.data?.startUrl) {
        window.open(response.data.startUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      actionLockRef.current.delete(bookingId);
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 pb-16">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden border-b border-emerald-100 bg-linear-to-br from-emerald-50/80 via-white to-green-50/40 px-6 pb-10 pt-8 sm:px-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-green-100/40 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <Label>Mentor Workspace</Label>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600/90 leading-relaxed tracking-wide">
            Manage your mentoring sessions, respond to requests, and see the difference you&apos;re making — all in one beautifully connected space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/mentor/requests"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
            >
              Review {stats?.pending || 0} requests <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/mentor/schedule"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
            >
              Set Availability
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 pt-8 sm:px-8 mx-auto" style={{ maxWidth: '1600px' }}>
        {/* Stats Glassmorphic Board */}
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm lg:grid-cols-4">
          {statItems.map((s, i) => (
            <div
              key={s.label}
              className={`group relative px-6 py-6 transition-colors hover:bg-emerald-50/50 ${i < statItems.length - 1 ? 'border-r border-emerald-100' : ''}`}
            >
              <div className="flex justify-between items-start">
                  <Label>{s.label}</Label>
                  <s.icon size={16} className="text-emerald-300 group-hover:text-emerald-400 transition-colors" />
                </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                {s.value}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 font-medium">
                {s.sub}
              </p>
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-linear-to-r from-emerald-500 to-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Upcoming sessions */}
            <Card>
              <div className="flex flex-col gap-5 border-b border-emerald-200 bg-emerald-50/30 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Label>Scheduled Sessions</Label>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    Separate session cards
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  </span>
                  {spotlightMeetings.length > 0 ? `${spotlightMeetings.length} upcoming` : 'No upcoming session'}
                </div>
              </div>

              {spotlightMeetings.length === 0 ? (
                <div className="p-12 text-center text-slate-600">No upcoming confirmed sessions right now.</div>
              ) : (
                <div className="grid gap-4 p-6 sm:p-8">
                  {spotlightMeetings.map((meeting, index) => {
                    const meetingStart = getBookingStart(meeting);

                    if (!meetingStart) return null;

                    const isPrimary = index === 0;

                    return (
                      <div
                        key={meeting._id}
                        className={`rounded-3xl border-2 ${isPrimary ? 'border-emerald-300 bg-linear-to-br from-white via-emerald-50/40 to-green-50/50' : 'border-emerald-200 bg-white'} p-6 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.5)]`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                              {isPrimary ? 'Upcoming Meeting' : 'Next After That'}
                            </p>
                            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                              {meeting.student?.name || 'Student'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartSession(meeting._id)}
                            disabled={actionLoadingId === meeting._id}
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingId === meeting._id ? 'Starting...' : 'Start Session'}
                          </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-emerald-300 bg-white px-5 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Meeting date</p>
                            <p className="mt-2 text-xl font-bold text-slate-900">{formatMeetingDate(meetingStart)}</p>
                          </div>
                          <div className="rounded-2xl border border-emerald-300 bg-white px-5 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Meeting time</p>
                            <p className="mt-2 text-xl font-bold text-slate-900">{formatMeetingTimeOnly(meetingStart)}</p>
                          </div>
                        </div>

                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Session mode: {meeting.sessionType === 'chat' ? 'Chat' : 'Video'}
                        </p>
                        <div className="mt-3">
                          <CalendarSyncButton booking={meeting} userRole="mentor" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Student requests */}
            <Card>
              <div className="border-b border-emerald-50 bg-emerald-50/30 px-6 py-6">
                <Label>Student requests</Label>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  New mentees looking for guidance
                </h2>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-600">You have no pending mentorship requests.</div>
              ) : (
                <ul className="divide-y divide-emerald-50/50">
                  {pendingRequests.map((r) => (
                    <li key={r._id} className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-emerald-50/30">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {r.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {r.student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            Requested for: {formatDate(r.date)} at {r.startTime}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusCls[r.status] || statusCls.pending}`}>
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            <Card>
              <div className="border-b border-emerald-50 bg-emerald-50/30 px-6 py-5">
                <Label>Recent Activity</Label>
              </div>
              {recentHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-600 text-sm">No recent activity found.</div>
              ) : (
                <ul className="divide-y divide-emerald-50/50">
                  {recentHistory.map((item) => (
                    <li key={item._id} className="group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-emerald-50/30">
                      <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 shadow-sm group-hover:bg-emerald-50 transition-colors">
                        <Clock3 size={14} className="text-emerald-600 group-hover:text-emerald-700 transition-colors" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">Session with {item.student?.name || 'Student'}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                           {formatDate(item.date)} · {item.startTime}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-slate-600 leading-relaxed capitalize">Status: {item.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentorDashboard() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorDashboardLayout>
        <MentorDashboardContent />
      </MentorDashboardLayout>
    </ProtectedRoute>
  );
}
