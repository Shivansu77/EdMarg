'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SessionRecordingPlayer from '@/components/SessionRecordingPlayer';
import { getImageUrl } from '@/utils/imageUrl';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Mentor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface BookingDetails {
  _id: string;
  mentor: Mentor;
  date: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  sessionType: string;
  status: string;
}

// ─── Content Component ─────────────────────────────────────────────────────
function RecordingPageContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        await apiClient.get('/api/v1/zoom/process-pending?limit=1');

        // Fetch broader history to include sessions that may still be
        // in-progress but already expose a recording URL.
        const response = await apiClient.get<{ bookings: BookingDetails[] }>(
          '/api/v1/bookings/my-bookings?limit=100'
        );
        if (response.success && response.data?.bookings) {
          const found = response.data.bookings.find((b) => b._id === sessionId);
          if (found) {
            setBooking(found);
          } else {
            setError('Session not found');
          }
        } else {
          setError('Failed to load session details');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchBooking();
  }, [sessionId]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <DashboardLayout userName={user?.name || 'Recording'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Navigation */}
        <button
          onClick={() => router.push('/student/history')}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Session History
        </button>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Session Recording
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Watch your mentorship session recording securely.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <>
            {/* Video Player */}
            {sessionId && (
              <div className="mb-8">
                <SessionRecordingPlayer sessionId={sessionId} />
              </div>
            )}

            {/* Session Details Card */}
            {booking && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Session Details
                </h2>

                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {booking.mentor.profileImage ? (
                      <Image
                        src={getImageUrl(
                          booking.mentor.profileImage,
                          booking.mentor.name
                        )}
                        alt={booking.mentor.name}
                        width={48}
                        height={48}
                        className="object-cover object-top"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {booking.mentor.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {booking.mentor.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(booking.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {booking.startTime} – {booking.endTime} (
                    {booking.sessionDuration} min)
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Page Export (Protected Route) ──────────────────────────────────────────
export default function RecordingPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <RecordingPageContent />
    </ProtectedRoute>
  );
}
