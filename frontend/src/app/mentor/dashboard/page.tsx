'use client';

import React, { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import CalendarSyncButton from '@/components/common/CalendarSyncButton';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Target,
  Users,
  Activity,
  Loader2,
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
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-slate-100 text-slate-800 border border-slate-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
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
    <div className={`rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
          apiClient.get<User>('/api/v1/users/me'),
          apiClient.get<BookingStats>('/api/v1/mentor/bookings/stats'),
          apiClient.get<Booking[] | { bookings: Booking[] }>('/api/v1/mentor/bookings/upcoming?limit=25'),
          apiClient.get<{ bookings: Booking[] }>('/api/v1/mentor/bookings?status=pending&limit=5'),
          apiClient.get<{ bookings: Booking[] }>('/api/v1/mentor/bookings?limit=5'),
        ]);

        if (meRes.data) setUser(meRes.data);
        if (statsRes.data) setStats(statsRes.data);

        // Safe array extraction for upcoming bookings
        if (upcomingRes.data) {
          const rawUpcoming = upcomingRes.data;
          const allUpcoming: Booking[] = Array.isArray(rawUpcoming)
            ? rawUpcoming
            : (rawUpcoming as { bookings?: Booking[] })?.bookings || [];

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

        if (pendingRes.data?.bookings) {
          setPendingRequests(pendingRes.data.bookings);
        }

        if (historyRes.data?.bookings) {
          const allHistory = historyRes.data.bookings;
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
    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading mentor dashboard...</p>
      </div>
    );
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Mentor';

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
    <div className="space-y-8 pb-12">
      {/* Minimalist Hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
            Mentor Workspace
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            Manage your mentorship sessions, respond to student requests, and track your impact.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/mentor/requests"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Review {stats?.pending || 0} requests <ArrowRight size={16} />
            </Link>
            <Link
              href="/mentor/schedule"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Set Availability
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300"
          >
            <div className="flex items-center justify-between mb-3">
              <Label>{s.label}</Label>
              <s.icon size={18} className="text-slate-400" />
            </div>
            <p className="text-3xl font-semibold tracking-tight text-slate-900 mb-1">
              {s.value}
            </p>
            <p className="text-xs text-slate-500 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main 2-column Grid */}
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          <Card>
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label>Scheduled Sessions</Label>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                  Upcoming Sessions
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {spotlightMeetings.length > 0 ? `${spotlightMeetings.length} upcoming` : 'No upcoming session'}
              </div>
            </div>

            {spotlightMeetings.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No upcoming confirmed sessions right now.
              </div>
            ) : (
              <div className="grid gap-4 p-6">
                {spotlightMeetings.map((meeting, index) => {
                  const meetingStart = getBookingStart(meeting);
                  if (!meetingStart) return null;
                  const isPrimary = index === 0;

                  return (
                    <div
                      key={meeting._id}
                      className={`rounded-xl border ${isPrimary ? 'border-slate-300 bg-slate-50/60' : 'border-slate-200 bg-white'} p-5`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {isPrimary ? 'Next Session' : 'Upcoming Session'}
                          </p>
                          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                            {meeting.student?.name || 'Student'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartSession(meeting._id)}
                          disabled={actionLoadingId === meeting._id}
                          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoadingId === meeting._id ? 'Starting...' : 'Start Session'}
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Date</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{formatMeetingDate(meetingStart)}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Time</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{formatMeetingTimeOnly(meetingStart)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium capitalize">
                          Mode: {meeting.sessionType === 'chat' ? 'Chat' : 'Video'}
                        </span>
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
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-5">
              <Label>Student Requests</Label>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                New Mentorship Requests
              </h2>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No pending mentorship requests.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pendingRequests.map((r) => (
                  <li key={r._id} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-semibold">
                        {r.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {r.student?.name || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {formatDate(r.date)} at {r.startTime}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-[11px] font-medium capitalize ${statusCls[r.status] || statusCls.pending}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right column: Recent Activity */}
        <div className="space-y-8">
          <Card>
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-5">
              <Label>Activity</Label>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Recent History
              </h2>
            </div>
            {recentHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recent activity found.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentHistory.map((item) => (
                  <li key={item._id} className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-slate-50/60">
                    <div className="mt-0.5 rounded-md bg-slate-100 p-1.5 shrink-0 text-slate-600">
                      <Clock3 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        Session with {item.student?.name || 'Student'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatDate(item.date)} · {item.startTime}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-600 capitalize">
                        Status: {item.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
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
