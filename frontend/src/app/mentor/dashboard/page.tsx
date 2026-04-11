'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
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
}

interface Booking {
  _id: string;
  student: Student;
  date: string;
  startTime: string;
  endTime: string;
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

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500/80">
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

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [meRes, statsRes, upcomingRes, pendingRes, historyRes] = await Promise.all([
          apiClient.get('/api/v1/users/me'),
          apiClient.get('/api/v1/mentor/bookings/stats'),
          apiClient.get('/api/v1/mentor/bookings/upcoming'),
          apiClient.get('/api/v1/mentor/bookings?status=pending&limit=5'),
          apiClient.get('/api/v1/mentor/bookings?limit=5') // Get recent for history
        ]);

        if (meRes.data) setUser(meRes.data as User);
        if (statsRes.data) setStats(statsRes.data as BookingStats);
        
        // Filter strictly future for upcoming
        if (upcomingRes.data) {
           const allUpcoming = upcomingRes.data as Booking[];
           const strictlyUpcoming = allUpcoming.filter((b: Booking) => {
              if (isPastDate(b.date)) return false;
              return b.status === 'confirmed' || b.status === 'in-progress';
           });
           setUpcomingBookings(strictlyUpcoming.slice(0, 5));
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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 px-6 pb-10 pt-8 sm:px-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <Label>Mentor Workspace</Label>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600/90 leading-relaxed tracking-wide">
            Manage your mentoring sessions, respond to requests, and see the difference you&apos;re making — all in one beautifully connected space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/mentor/requests"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
            >
              Review {stats?.pending || 0} requests <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/mentor/schedule"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
            >
              View schedule
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 pt-8 sm:px-8 max-w-[1600px] mx-auto">
        {/* Stats Glassmorphic Board */}
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:grid-cols-4">
          {statItems.map((s, i) => (
            <div
              key={s.label}
              className={`group relative px-6 py-6 transition-colors hover:bg-gray-50/50 ${i < statItems.length - 1 ? 'border-r border-gray-100' : ''}`}
            >
              <div className="flex justify-between items-start">
                  <Label>{s.label}</Label>
                  <s.icon size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 group-hover:text-indigo-900 transition-colors">
                {s.value}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 font-medium">
                {s.sub}
              </p>
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Upcoming sessions */}
            <Card>
              <div className="flex items-start justify-between gap-4 border-b border-gray-50 bg-gray-50/30 px-6 py-6">
                <div>
                  <Label>This week</Label>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    Stay on top of your mentoring impact
                  </h2>
                </div>
                <span className="mt-1 shrink-0 rounded-full border border-indigo-100 bg-white/80 shadow-sm px-4 py-1.5 text-sm font-bold text-indigo-600">
                  {upcomingBookings.length} upcoming
                </span>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No scheduled sessions in your timeline.</div>
              ) : (
                <ul className="divide-y divide-gray-50/50">
                  {upcomingBookings.map((item) => (
                    <li key={item._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-gray-50/30">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                          {item.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">Session with {item.student?.name || 'Student'}</p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500 font-medium">1-on-1 Mentorship Session</p>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex gap-2 w-full justify-between items-center sm:w-auto">
                        <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm">
                            {formatDate(item.date)} · {item.startTime}
                        </span>
                        {(item.startUrl || item.meetingLink) && (
                          <a href={item.startUrl || item.meetingLink} target="_blank" rel="noreferrer" className="text-xs bg-indigo-50 px-3 py-1.5 rounded-full text-indigo-600 font-bold border border-indigo-100 hover:bg-indigo-100">Start Session</a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Student requests */}
            <Card>
              <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-6">
                <Label>Student requests</Label>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  New mentees looking for guidance
                </h2>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="p-12 text-center text-gray-500">You have no pending mentorship requests.</div>
              ) : (
                <ul className="divide-y divide-gray-50/50">
                  {pendingRequests.map((r) => (
                    <li key={r._id} className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-gray-50/30">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                          {r.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {r.student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
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
              <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-5">
                <Label>Recent Activity</Label>
              </div>
              {recentHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No recent activity found.</div>
              ) : (
                <ul className="divide-y divide-gray-50/50">
                  {recentHistory.map((item) => (
                    <li key={item._id} className="group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50/30">
                      <div className="mt-0.5 rounded-full bg-gray-100 p-1.5 shadow-sm group-hover:bg-indigo-50 transition-colors">
                        <Clock3 size={14} className="text-gray-500 group-hover:text-indigo-500 transition-colors" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900">Session with {item.student?.name || 'Student'}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                           {formatDate(item.date)} · {item.startTime}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-gray-500 leading-relaxed capitalize">Status: {item.status}</p>
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
