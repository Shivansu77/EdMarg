/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getImageUrl } from '@/utils/imageUrl';
import Image from 'next/image';
import {
  CalendarClock,
  Video,
  User as UserIcon,
  MessageSquare,
  PlayCircle,
  AlertCircle,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

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
  sessionDuration: number;
  sessionType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  notes: string;
  price: number;
  createdAt: string;
  zoomMeetingId?: string;
  joinUrl?: string;
  startUrl?: string;
  recordingUrl?: string;
  zoomError?: string;
}

type BookingTab = 'pending' | 'upcoming' | 'past';

const actionSuccessMessages: Record<'accept' | 'reject' | 'start' | 'complete', string> = {
  accept: 'Booking confirmed successfully.',
  reject: 'Booking rejected.',
  start: 'Session started successfully.',
  complete: 'Session marked as completed.',
};

const resolveActiveTab = (value: string | null): BookingTab => {
  if (value === 'upcoming' || value === 'past') return value;
  return 'pending';
};

const statusConfig = {
  pending: {
    dot: 'bg-amber-400',
    label: 'New Request',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  confirmed: {
    dot: 'bg-emerald-500',
    label: 'Confirmed',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  'in-progress': {
    dot: 'bg-blue-500 animate-pulse',
    label: 'In Progress',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  completed: {
    dot: 'bg-slate-300',
    label: 'Completed',
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  cancelled: {
    dot: 'bg-red-400',
    label: 'Cancelled',
    badge: 'border-red-200 bg-red-50 text-red-700',
  },
  rejected: {
    dot: 'bg-red-400',
    label: 'Rejected',
    badge: 'border-red-200 bg-red-50 text-red-700',
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{cfg.label}</span>
    </div>
  );
}

function MentorRequestsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<BookingTab>(() =>
    resolveActiveTab(searchParams.get('tab'))
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const inFlightActionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'mentor') {
      router.push('/student/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ bookings: Booking[] }>(
        '/api/v1/mentor/bookings?limit=50'
      );
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
  }, []);

  useEffect(() => {
    if (user?.role === 'mentor') fetchBookings();
  }, [user, fetchBookings]);

  useEffect(() => {
    setActiveTab(resolveActiveTab(searchParams.get('tab')));
  }, [searchParams]);

  const handleAction = async (
    bookingId: string,
    action: 'accept' | 'reject' | 'start' | 'complete',
    reason?: string
  ) => {
    if (inFlightActionsRef.current.has(bookingId)) return;
    inFlightActionsRef.current.add(bookingId);
    setActionLoading(bookingId);
    try {
      const payload = reason ? { reason } : undefined;
      const res = await apiClient.put<{ startUrl?: string }>(
        `/api/v1/mentor/bookings/${bookingId}/${action}`,
        payload
      );
      if (res.success) {
        toast.success(actionSuccessMessages[action]);
        if ((action === 'start' || action === 'accept') && res.data?.startUrl) {
          window.open(res.data.startUrl, '_blank');
        }
        fetchBookings();
      } else {
        toast.error(res.message || `Failed to ${action} booking`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      inFlightActionsRef.current.delete(bookingId);
      setActionLoading(null);
    }
  };

  const handleRetryZoom = async (bookingId: string) => {
    if (inFlightActionsRef.current.has(bookingId)) return;
    inFlightActionsRef.current.add(bookingId);
    setActionLoading(bookingId);
    try {
      const res = await apiClient.put<{ startUrl?: string }>(
        `/api/v1/mentor/bookings/${bookingId}/start`
      );
      if (res.success) {
        toast.success('Zoom link generated successfully.');
        if (res.data?.startUrl) window.open(res.data.startUrl, '_blank');
        fetchBookings();
      } else {
        toast.error(res.message || 'Failed to generate Zoom link');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      inFlightActionsRef.current.delete(bookingId);
      setActionLoading(null);
    }
  };

  const tabCounts = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    upcoming: bookings.filter((b) => b.status === 'confirmed' || b.status === 'in-progress').length,
    past: bookings.filter(
      (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected'
    ).length,
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'in-progress';
    if (activeTab === 'past')
      return b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  const hasPendingBookings = bookings.some((b) => b.status === 'pending');
  const newPendingBookings = bookings.filter((b) => {
    if (b.status !== 'pending') return false;
    const t = new Date(b.createdAt).getTime();
    return !Number.isNaN(t) && Date.now() - t <= 24 * 60 * 60 * 1000;
  }).length;

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));

  if (authLoading || loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading bookings...</p>
          </div>
        </div>
      </MentorDashboardLayout>
    );
  }

  const tabs: { id: BookingTab; label: string }[] = [
    { id: 'pending', label: 'Requests' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <MentorDashboardLayout>
      <div className="min-h-screen pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1">
            Mentor Workspace
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Session Requests
            </h1>
            {hasPendingBookings && (
              <div className="relative inline-flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </div>
            )}
            {newPendingBookings > 0 && (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {newPendingBookings} new
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Manage incoming applications, scheduled sessions, and review your past engagements.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-900">Unable to synchronize bookings</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4 border border-emerald-100">
                <CalendarClock className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'pending' ? 'No requests' : `No ${activeTab} sessions`}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
                {activeTab === 'pending'
                  ? "You don't have any new student requests right now."
                  : `You don't have any ${activeTab} bookings actively scheduled.`}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <article
                key={booking._id}
                className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 md:gap-8 transition-all hover:shadow-[0_8px_30px_rgba(16,185,129,0.07)] hover:border-emerald-200/60"
              >
                {/* Left: Student & Details */}
                <div className="flex-1 min-w-0">
                  {/* Status row */}
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <StatusBadge status={booking.status} />
                    {booking.status === 'pending' && (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="relative inline-flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        New Booking
                      </div>
                    )}
                  </div>

                  {/* Student info */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {booking.student.profileImage ? (
                        <Image
                          src={getImageUrl(booking.student.profileImage, booking.student.name)}
                          alt={booking.student.name}
                          width={48}
                          height={48}
                          className="object-cover object-top"
                        />
                      ) : (
                        <span className="text-sm font-bold text-emerald-700">
                          {booking.student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{booking.student.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{booking.student.email}</p>
                    </div>
                  </div>

                  {/* Session meta */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        {booking.startTime} – {booking.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        Type
                      </p>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        {booking.sessionType === 'video' ? (
                          <Video size={13} className="text-slate-400" />
                        ) : (
                          <MessageSquare size={13} className="text-slate-400" />
                        )}
                        {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1)}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Student Note
                      </p>
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        &ldquo;{booking.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Actions & Price */}
                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-7">
                  {/* Price */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Session Rate
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                      {booking.price ? (
                        <>
                          <IndianRupee size={18} className="text-emerald-500" />
                          {booking.price}
                        </>
                      ) : (
                        'Free'
                      )}
                    </p>

                    {/* Zoom credentials */}
                    {(booking.status === 'confirmed' || booking.status === 'in-progress') &&
                      booking.sessionType !== 'chat' && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          {booking.startUrl ? (
                            <>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Zoom Credentials
                              </p>
                              <p className="text-xs font-mono text-slate-600 truncate bg-white px-2 py-1 rounded-lg border border-slate-200">
                                {booking.zoomMeetingId}
                              </p>
                              <a
                                href={booking.startUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 w-full mt-1 transition-colors"
                              >
                                Open App <ExternalLink size={10} />
                              </a>
                            </>
                          ) : booking.zoomError ? (
                            <>
                              <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                                <AlertTriangle size={12} /> Zoom Link Failed
                              </p>
                              <button
                                onClick={() => handleRetryZoom(booking._id)}
                                disabled={actionLoading === booking._id}
                                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2 py-1 rounded-lg w-fit flex items-center gap-1.5 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === booking._id ? (
                                  <RefreshCw size={10} className="animate-spin" />
                                ) : (
                                  <RefreshCw size={10} />
                                )}
                                Retry Link
                              </button>
                            </>
                          ) : (
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                              Zoom link will generate upon session init.
                            </p>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2.5 mt-auto">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(booking._id, 'accept')}
                          disabled={actionLoading === booking._id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {actionLoading === booking._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleAction(booking._id, 'reject')}
                          disabled={actionLoading === booking._id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          <XCircle className="w-4 h-4 text-slate-400" />
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(booking._id, 'start')}
                        disabled={actionLoading === booking._id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                      >
                        {actionLoading === booking._id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                        Start Session
                      </button>
                    )}

                    {booking.status === 'in-progress' && (
                      <>
                        {booking.startUrl && (
                          <a
                            href={booking.startUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                          >
                            <PlayCircle className="w-4 h-4 text-slate-400" />
                            Return to Zoom
                          </a>
                        )}
                        <button
                          onClick={() => handleAction(booking._id, 'complete')}
                          disabled={actionLoading === booking._id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                          {actionLoading === booking._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Complete
                        </button>
                      </>
                    )}

                    {activeTab === 'past' && booking.recordingUrl && (
                      <a
                        href={booking.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        <Video size={16} className="text-slate-400" />
                        View Recording
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorRequestsPage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorRequestsContent />
    </ProtectedRoute>
  );
}
