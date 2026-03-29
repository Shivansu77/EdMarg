'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
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
      const response = await apiClient.get('/api/bookings/my-bookings?limit=50');
      if (response.success && (response as any).bookings) {
        setBookings((response as any).bookings);
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
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return ['pending', 'confirmed', 'in-progress'].includes(b.status);
    if (activeTab === 'past') return ['completed', 'cancelled', 'rejected'].includes(b.status);
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };

  return (
    <DashboardLayout userName={user?.name || "Student Schedule"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Sessions</h1>
            <p className="mt-2 text-sm text-gray-500">View and manage your mentorship bookings.</p>
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
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'upcoming'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'past'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No {activeTab} sessions</h3>
            <p className="mt-1 text-sm text-gray-500">You don&apos;t have any {activeTab} sessions at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Mentor Info */}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {booking.mentor.profileImage ? (
                          <Image src={booking.mentor.profileImage} alt={booking.mentor.name} width={48} height={48} className="object-cover" />
                        ) : (
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.mentor.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {booking.mentor.email}
                        </p>
                        {booking.notes && (
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <span className="font-medium text-gray-900 block mb-1">Your notes:</span>
                            &ldquo;{booking.notes}&rdquo;
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
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    {activeTab === 'upcoming' && booking.status === 'confirmed' && booking.joinUrl && (
                      <a
                        href={booking.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Zoom Meeting
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    )}
                    
                    {activeTab === 'upcoming' && booking.status === 'in-progress' && booking.joinUrl && (
                      <a
                        href={booking.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors animate-pulse shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Session in Progress - Join Now
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    )}

                    {activeTab === 'past' && booking.recordingUrl && (
                      <a
                        href={booking.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      >
                        <Video className="w-4 h-4 mr-2" />
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
