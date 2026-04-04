'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import { getImageUrl } from '@/utils/imageUrl';
import {
  Video,
  Clock,
  Calendar,
  User as UserIcon,
  AlertCircle,
  CheckCircle2
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
  recordingUrl?: string;
}

function HistoryContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<{ bookings: Booking[] }>('/api/v1/bookings/my-bookings?limit=50&status=completed');
        if (response.success && response.data?.bookings) {
          setBookings(response.data.bookings);
        } else {
          setError(response.message || 'Failed to load session history');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <DashboardLayout userName={user?.name || "Session History"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Session History</h1>
            <p className="mt-2 text-sm text-gray-500">Review your past mentorship sessions and recordings.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No past sessions</h3>
            <p className="mt-1 text-sm text-gray-500">You haven&apos;t completed any sessions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {booking.mentor.profileImage ? (
                        <Image src={getImageUrl(booking.mentor.profileImage, booking.mentor.name)} alt={booking.mentor.name} width={48} height={48} className="object-cover object-top" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.mentor.name}</h3>
                      <p className="text-sm text-gray-500">{booking.mentor.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(booking.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.startTime} ({booking.sessionDuration} min)
                    </div>
                  </div>

                  {booking.recordingUrl ? (
                    <a
                      href={booking.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Watch Session Recording
                    </a>
                  ) : (
                    <div className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed">
                      No recording available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <HistoryContent />
    </ProtectedRoute>
  );
}
