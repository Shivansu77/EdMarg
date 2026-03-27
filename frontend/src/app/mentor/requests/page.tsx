'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  Calendar,
  User as UserIcon,
  MessageSquare,
  PlayCircle,
  AlertCircle,
  Check
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
}

export default function MentorRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'past'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // bookingId

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'mentor') {
      router.push('/student/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/mentor/bookings?limit=50');
      if (response.success && response.data?.bookings) {
        setBookings(response.data.bookings);
      } else if (response.success && response.bookings) {
        // Fallback in case the controller sends bookings at root
        setBookings(response.bookings);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'mentor') {
      fetchBookings();
    }
  }, [user]);

  const handleAction = async (bookingId: string, action: 'accept' | 'reject' | 'start' | 'complete', reason?: string) => {
    setActionLoading(bookingId);
    try {
      const payload = reason ? { reason } : undefined;
      const res = await apiClient.put(`/api/mentor/bookings/${bookingId}/${action}`, payload);
      if (res.success) {
        // Refresh bookings
        fetchBookings();
      } else {
        alert(res.message || `Failed to ${action} booking`);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"><Check className="w-3 h-3 mr-1" /> Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3 h-3 mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Session Requests</h1>
          <p className="mt-2 text-sm text-gray-500">Manage your incoming booking requests and upcoming sessions.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {(['pending', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                activeTab === tab ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
              }`}>
                {bookings.filter(b => {
                  if (tab === 'pending') return b.status === 'pending';
                  if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'in-progress';
                  return b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected';
                }).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No {activeTab} sessions</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any {activeTab} sessions at the moment.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  {/* Student Info */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.student.profileImage ? (
                        <Image src={booking.student.profileImage} alt={booking.student.name} width={48} height={48} className="object-cover" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.student.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {booking.student.email}
                      </p>
                      {booking.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="font-medium text-gray-900 block mb-1">Note from student:</span>
                          "{booking.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {getStatusBadge(booking.status)}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.startTime} - {booking.endTime} ({booking.sessionDuration} min)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Video className="w-4 h-4 text-gray-400" />
                      {booking.sessionType.charAt(0).toUpperCase() + booking.sessionType.slice(1)} Session
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {activeTab !== 'past' && (
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(booking._id, 'reject')}
                          disabled={actionLoading === booking._id}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(booking._id, 'accept')}
                          disabled={actionLoading === booking._id}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === booking._id ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Accept Request
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(booking._id, 'start')}
                        disabled={actionLoading === booking._id}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                      >
                       {actionLoading === booking._id ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                        Start Session
                      </button>
                    )}

                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => handleAction(booking._id, 'complete')}
                        disabled={actionLoading === booking._id}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {actionLoading === booking._id ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Check className="w-4 h-4 mr-2" />}
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
