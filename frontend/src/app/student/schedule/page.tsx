'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import { getImageUrl } from '@/utils/imageUrl';
import {
  CalendarClock,
  Video,
  Clock,
  Calendar,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Booking {
  _id: string;
  mentor: Mentor;
  date: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  sessionType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  notes: string;
  price: number;
  createdAt: string;
  zoomMeetingId?: string;
  joinUrl?: string;
  recordingUrl?: string;
}

function ScheduleContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ bookings: Booking[] }>('/api/v1/bookings/my-bookings?limit=50');
      if (response.success && response.data?.bookings) {
        setBookings(response.data.bookings);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return ['pending', 'confirmed', 'in-progress'].includes(b.status);
    if (activeTab === 'past') {
      return ['completed', 'cancelled', 'rejected'].includes(b.status) || Boolean(b.recordingUrl);
    }
    return true;
  });

  const upcomingCount = bookings.filter((b) => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const todayKey = new Date().toDateString();
  const todayCount = bookings.filter((b) => new Date(b.date).toDateString() === todayKey).length;

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-pulse"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  return (
    <DashboardLayout userName={user?.name || "Student Schedule"}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-indigo-50/60 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Session Planner
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Your Schedule</h1>
              <p className="mt-2 text-sm text-slate-600">
                Keep track of confirmed calls, live sessions, and completed mentorship meetings in one clean timeline.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{upcomingCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{todayCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Session Timeline</h2>
            <p className="mt-1 text-sm text-slate-500">View and manage your mentorship bookings.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-8 inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
          <nav className="flex gap-1.5" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`
                whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
                ${activeTab === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`
                whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
                ${activeTab === 'past'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              Past Sessions
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <CalendarClock className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No {activeTab} sessions</h3>
            <p className="mt-1 text-sm text-slate-500">You don&apos;t have any {activeTab} sessions at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
                <div className="p-6 sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                        {booking.mentor.profileImage ? (
                          <Image src={getImageUrl(booking.mentor.profileImage, booking.mentor.name)} alt={booking.mentor.name} width={56} height={56} className="h-14 w-14 object-cover object-top" />
                        ) : (
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{booking.mentor.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {booking.mentor.email}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {getStatusBadge(booking.status)}
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            ${booking.price}
                          </span>
                        </div>

                        {booking.notes && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                            <span className="mb-1 block font-semibold text-slate-900">Your notes</span>
                            &ldquo;{booking.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid min-w-57.5 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {booking.startTime} - {booking.endTime} ({booking.sessionDuration} min)
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Video className="h-4 w-4 text-slate-400" />
                        {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1)} Session
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                    {activeTab === 'upcoming' && booking.status === 'confirmed' && booking.joinUrl && (
                      <a
                        href={booking.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Zoom Meeting
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    )}
                    
                    {activeTab === 'upcoming' && booking.status === 'in-progress' && booking.joinUrl && (
                      <a
                        href={booking.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex animate-pulse items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Session in Progress - Join Now
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    )}

                    {activeTab === 'past' && booking.recordingUrl && (
                      <a
                        href={booking.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Watch Recording
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
