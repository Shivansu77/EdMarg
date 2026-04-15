'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-900 border border-cyan-200 animate-pulse"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-900 border border-gray-300">Completed</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-900 border border-red-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  return (
    <DashboardLayout userName={user?.name || "Student Schedule"}>
      <div className="space-y-8 pb-16 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">

        {/* Dynamic Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-8 sm:px-8">
          <div className="max-w-4xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                Session Planner
              </p>
              <h1 className="text-4xl font-bold text-black">
                Your Schedule
              </h1>
              <p className="text-gray-600 mt-2">
                Keep track of confirmed calls, live sessions, and completed mentorship meetings.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upcoming</p>
                <p className="mt-1 text-2xl font-black text-black">{upcomingCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Today</p>
                <p className="mt-1 text-2xl font-black text-black">{todayCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Completed</p>
                <p className="mt-1 text-2xl font-black text-black">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 max-w-[1500px] mx-auto space-y-8">

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-4 shadow-sm relative z-20">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upcoming'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'past'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
            >
              Past Sessions
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block relative">
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                  <div className="w-12 h-12 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest">Loading schedule...</p>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ring-8 ring-gray-50/50">
                <CalendarClock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-gray-900">No {activeTab} sessions</h3>
              <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">You don&apos;t have any {activeTab} sessions at the moment.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-gray-500 font-medium text-sm">
                  Showing <span className="font-black text-gray-900">{filteredBookings.length}</span> sessions
                </div>
              </div>

              <div className="space-y-5">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl hover:border-black transition-all duration-300">
                    <div className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                            {booking.mentor.profileImage ? (
                              <Image src={getImageUrl(booking.mentor.profileImage, booking.mentor.name)} alt={booking.mentor.name} width={56} height={56} className="h-14 w-14 object-cover object-top" />
                            ) : (
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">{booking.mentor.name}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-500">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {booking.mentor.email}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {getStatusBadge(booking.status)}
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 border border-gray-200">
                                ${booking.price}
                              </span>
                            </div>

                            {booking.notes && (
                              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                                <span className="mb-1 block font-bold text-gray-900">Your notes:</span>
                                &ldquo;{booking.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid min-w-57.5 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(booking.date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {booking.startTime} - {booking.endTime} ({booking.sessionDuration} min)
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Video className="h-4 w-4 text-gray-400" />
                            {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1)} Session
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                        {activeTab === 'upcoming' && booking.status === 'confirmed' && booking.joinUrl && (
                          <a
                            href={booking.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-800"
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
                            className="inline-flex animate-pulse items-center rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-700"
                          >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Session in Progress
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        )}

                        {activeTab === 'past' && booking.recordingUrl && (
                          <Link
                            href={`/student/recordings/${booking._id}`}
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Watch Recording
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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
