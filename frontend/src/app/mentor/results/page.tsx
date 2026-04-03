'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface MentorSettings {
  pricePerSession: number;
  sessionDuration: number;
  autoConfirm: boolean;
  sessionNotes: string;
  totalSessions: number;
  rating: number;
}

interface RecentBooking {
  _id: string;
  date: string;
  startTime: string;
  sessionType: string;
  status: string;
  student?: {
    name: string;
    email: string;
  };
}

const EMPTY_STATS: BookingStats = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
  total: 0,
};

const EMPTY_SETTINGS: MentorSettings = {
  pricePerSession: 0,
  sessionDuration: 45,
  autoConfirm: true,
  sessionNotes: '',
  totalSessions: 0,
  rating: 0,
};

function MentorResultsContent() {
  const [stats, setStats] = useState<BookingStats>(EMPTY_STATS);
  const [settings, setSettings] = useState<MentorSettings>(EMPTY_SETTINGS);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsResponse, settingsResponse, bookingsResponse] = await Promise.all([
          apiClient.get<BookingStats>('/api/v1/mentor/bookings/stats'),
          apiClient.get<MentorSettings>('/api/v1/mentor/settings'),
          apiClient.get<{ bookings: RecentBooking[] }>('/api/v1/mentor/bookings?limit=8'),
        ]);

        if (!statsResponse.success || !statsResponse.data) {
          throw new Error(statsResponse.error || statsResponse.message || 'Unable to load booking stats');
        }

        if (!settingsResponse.success || !settingsResponse.data) {
          throw new Error(settingsResponse.error || settingsResponse.message || 'Unable to load mentor settings');
        }

        setStats(statsResponse.data);
        setSettings(settingsResponse.data);
        setRecentBookings(bookingsResponse.data?.bookings ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load mentor results');
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const responseQueue = stats.pending + stats.confirmed;
  const ratingLabel = settings.rating > 0 ? settings.rating.toFixed(1) : 'New';

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));

  const statCards = [
    {
      label: 'Completed sessions',
      value: settings.totalSessions || stats.completed,
      helper: 'Sessions delivered',
      icon: TrendingUp,
    },
    {
      label: 'Completion rate',
      value: `${completionRate}%`,
      helper: 'Completed vs total bookings',
      icon: BarChart3,
    },
    {
      label: 'Average rating',
      value: ratingLabel,
      helper: 'Student feedback score',
      icon: Star,
    },
    {
      label: 'Open queue',
      value: responseQueue,
      helper: 'Pending and confirmed bookings',
      icon: CalendarClock,
    },
  ];

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                Mentor Results
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                See how your mentoring pipeline is performing.
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Track completed sessions, keep an eye on response volume, and monitor the signals students are sending back.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/mentor/requests"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Review bookings
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/mentor/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Update settings
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, helper, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
                </div>
                <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">{helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking mix</h2>
                <p className="mt-1 text-sm text-gray-500">A quick snapshot of where sessions stand right now.</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: 'Pending', value: stats.pending, color: 'bg-amber-400' },
                { label: 'Confirmed', value: stats.confirmed, color: 'bg-blue-500' },
                { label: 'Completed', value: stats.completed, color: 'bg-emerald-500' },
                { label: 'Cancelled', value: stats.cancelled, color: 'bg-gray-400' },
              ].map((item) => {
                const width = stats.total > 0 ? Math.max(Math.round((item.value / stats.total) * 100), item.value > 0 ? 8 : 0) : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-gray-500">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Session settings impact</h2>
            <p className="mt-1 text-sm text-gray-500">The current defaults influencing how students book with you.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Session price</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">${settings.pricePerSession}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Session duration</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{settings.sessionDuration} min</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Booking mode</p>
                <p className="mt-2 text-lg font-bold text-gray-900">
                  {settings.autoConfirm ? 'Auto confirm' : 'Manual review'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Notes preset</p>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {settings.sessionNotes ? settings.sessionNotes : 'No default note saved yet.'}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent bookings</h2>
              <p className="mt-1 text-sm text-gray-500">Recent student activity across your mentorship queue.</p>
            </div>
            <Link href="/mentor/requests" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
              Open requests
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                No bookings yet. Once students start scheduling, their sessions will appear here.
              </div>
            ) : (
              recentBookings.map((booking) => (
                <article
                  key={booking._id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{booking.student?.name || 'Student session'}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(booking.date)} at {booking.startTime} • {booking.sessionType || 'video'}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                    {booking.status}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorResultsPage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorResultsContent />
    </ProtectedRoute>
  );
}
