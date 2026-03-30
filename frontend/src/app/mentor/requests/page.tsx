'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
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
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';

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

const resolveActiveTab = (value: string | null): BookingTab => {
  if (value === 'upcoming' || value === 'past') {
    return value;
  }

  return 'pending';
};

function MentorRequestsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<BookingTab>(() => resolveActiveTab(searchParams.get('tab')));
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const response = await apiClient.get<{ bookings: Booking[] }>('/api/mentor/bookings?limit=50');
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
    if (user?.role === 'mentor') {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  useEffect(() => {
    setActiveTab(resolveActiveTab(searchParams.get('tab')));
  }, [searchParams]);

  const handleAction = async (bookingId: string, action: 'accept' | 'reject' | 'start' | 'complete', reason?: string) => {
    setActionLoading(bookingId);
    try {
      const payload = reason ? { reason } : undefined;
      const res = await apiClient.put<{ startUrl?: string }>(`/api/mentor/bookings/${bookingId}/${action}`, payload);
      if (res.success) {
        if ((action === 'start' || action === 'accept') && res.data?.startUrl) {
          window.open(res.data.startUrl, '_blank');
        }
        fetchBookings();
      } else {
        alert(res.message || `Failed to ${action} booking`);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryZoom = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await apiClient.put<{ startUrl?: string }>(`/api/mentor/bookings/${bookingId}/start`);
      if (res.success) {
        if (res.data?.startUrl) {
          window.open(res.data.startUrl, '_blank');
        }
        fetchBookings();
      } else {
        alert(res.message || 'Failed to generate Zoom link');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'in-progress';
    if (activeTab === 'past') return b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending</div>;
      case 'confirmed':
        return <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed</div>;
      case 'in-progress':
        return <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> In Progress</div>;
      case 'completed':
        return <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-zinc-300"></span> Completed</div>;
      default:
        return <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-red-500"></span> {status}</div>;
    }
  };

  if (authLoading || loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh] bg-[#fafafa]">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="min-h-screen bg-[#fafafa] pb-24 font-sans selection:bg-zinc-900 selection:text-white">
        
        {/* Minimalist Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
           <div className="max-w-5xl mx-auto px-6 py-10 lg:px-8">
             <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Mentor Workspace</p>
             <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Session Requests</h1>
             <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
               Manage incoming applications, scheduled sessions, and review your past engagements.
             </p>
           </div>
           
           {/* Linear Border-Bottom Tabs */}
           <div className="max-w-5xl mx-auto px-6 lg:px-8 flex space-x-8 mt-2 overflow-x-auto no-scrollbar">
              {(['pending', 'upcoming', 'past'] as const).map((tab) => {
                 const isActive = activeTab === tab;
                 const count = bookings.filter(b => {
                    if (tab === 'pending') return b.status === 'pending';
                    if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'in-progress';
                    return b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected';
                  }).length;

                 return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      relative py-4 text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap
                      ${isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'}
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-100 text-zinc-500'}`}>
                      {count}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 rounded-t-full layout-indicator" />
                    )}
                  </button>
                )
              })}
           </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-8">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                 <p className="font-semibold text-sm text-red-900">Unable to synchronize bookings</p>
                 <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-zinc-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-50 mb-4 border border-zinc-100">
                   <CalendarClock className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">No {activeTab} sessions</h3>
                <p className="mt-1 text-sm text-zinc-500">You don&apos;t have any {activeTab} bookings actively scheduled.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <article key={booking._id} className="group bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col md:flex-row gap-6 md:gap-10 transition-shadow hover:shadow-sm">
                  
                  {/* Left Column: Student & Time */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                        {getStatusIndicator(booking.status)}
                        
                        {/* Display Zoom meeting details seamlessly attached to status area if present */}
                        {booking.status === 'confirmed' || booking.status === 'in-progress' ? (
                          <div className="md:hidden text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                             ID: {booking.zoomMeetingId || 'Generating...'}
                          </div>
                        ) : null}
                    </div>
                    
                    <div className="flex items-start gap-4 mb-5">
                       <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {booking.student.profileImage ? (
                            <Image src={booking.student.profileImage} alt={booking.student.name} width={48} height={48} className="object-cover" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-zinc-900">{booking.student.name}</h3>
                           <p className="text-sm text-zinc-500 mt-0.5">{booking.student.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date</p>
                           <p className="text-sm font-semibold text-zinc-900">{formatDate(booking.date)}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Time</p>
                           <p className="text-sm font-semibold text-zinc-900">{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Type</p>
                           <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                              {booking.sessionType === 'video' ? <Video size={14} className="text-zinc-400"/> : <MessageSquare size={14} className="text-zinc-400"/>}
                              {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1)}
                           </p>
                        </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-5 pt-5 border-t border-zinc-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Student Note</p>
                        <p className="text-sm text-zinc-600 italic">&quot;{booking.notes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Dynamic Actions & Zoom Details */}
                  <div className="md:w-[280px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 md:pl-8">
                     <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Session Rate</p>
                        <p className="text-2xl font-bold tracking-tight text-zinc-900">
                           {booking.price ? `₹${booking.price}` : 'Free'}
                        </p>
                        
                        {(booking.status === 'confirmed' || booking.status === 'in-progress') && booking.sessionType !== 'chat' && (
                           <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-2">
                              {booking.startUrl ? (
                                <>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Zoom Credentials</p>
                                  <p className="text-xs font-mono text-zinc-600 truncate bg-white px-2 py-1 rounded border border-zinc-200">{booking.zoomMeetingId}</p>
                                  <a href={booking.startUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 w-full mt-1">
                                    Open App <ExternalLink size={10} />
                                  </a>
                                </>
                              ) : booking.zoomError ? (
                                <>
                                  <p className="text-xs font-semibold text-red-800 flex items-center gap-1.5"><AlertTriangle size={12}/> Linking Failed</p>
                                  <button onClick={() => handleRetryZoom(booking._id)} disabled={actionLoading === booking._id} className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white px-2 py-1 rounded w-fit flex items-center gap-1.5 transition-colors disabled:opacity-50">
                                    {actionLoading === booking._id ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />} Retry Link
                                  </button>
                                </>
                              ) : (
                                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">Zoom link will generate upon session init.</p>
                              )}
                           </div>
                        )}
                     </div>

                     <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 mt-auto">
                        {booking.status === 'pending' && (
                          <>
                             <button
                               onClick={() => handleAction(booking._id, 'accept')}
                               disabled={actionLoading === booking._id}
                               className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                             >
                               {actionLoading === booking._id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 'Accept Request'}
                             </button>
                             <button
                               onClick={() => handleAction(booking._id, 'reject')}
                               disabled={actionLoading === booking._id}
                               className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                             >
                               Decline
                             </button>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleAction(booking._id, 'start')}
                            disabled={actionLoading === booking._id}
                            className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                          >
                           {actionLoading === booking._id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
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
                                 className="w-full flex items-center justify-center py-2 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all"
                               >
                                 <PlayCircle className="w-4 h-4 mr-2" />
                                 Return to Zoom
                               </a>
                            )}
                            <button
                              onClick={() => handleAction(booking._id, 'complete')}
                              disabled={actionLoading === booking._id}
                              className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-lg shadow-sm hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                              {actionLoading === booking._id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                              Complete
                            </button>
                          </>
                        )}

                        {activeTab === 'past' && booking.recordingUrl && (
                          <a
                            href={booking.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center py-2.5 text-sm font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-all"
                          >
                            <Video size={16} className="mr-2" />
                            Recording
                          </a>
                        )}
                     </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
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
