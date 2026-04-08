'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video, Calendar, Clock, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { getImageUrl } from '@/utils/imageUrl';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

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
  status: string;
  recordingUrl?: string;
}

function RecordingsContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<{ bookings: Booking[] }>(
          '/api/v1/bookings/my-bookings?limit=100'
        );
        if (response.success && response.data?.bookings) {
          setBookings(response.data.bookings.filter((booking) => Boolean(booking.recordingUrl)));
        } else {
          setError(response.message || response.error || 'Failed to load recordings');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load recordings');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));

  return (
    <DashboardLayout userName={user?.name || 'Recordings'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Session Recordings</h1>
          <p className="mt-2 text-sm text-gray-500">
            This is where you can watch your available mentorship session recordings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No recordings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Completed sessions with recordings will appear here.
            </p>
            <Link
              href="/student/schedule"
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Go to Schedule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {booking.mentor?.profileImage ? (
                        <Image
                          src={getImageUrl(booking.mentor.profileImage, booking.mentor.name)}
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.mentor?.name || 'Mentor'}
                      </h3>
                      <p className="text-sm text-gray-500">{booking.mentor?.email || ''}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.startTime} - {booking.endTime} ({booking.sessionDuration} min)
                    </div>
                  </div>

                  <Link
                    href={`/student/recordings/${booking._id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Watch Recording
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function RecordingsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <RecordingsContent />
    </ProtectedRoute>
  );
}
