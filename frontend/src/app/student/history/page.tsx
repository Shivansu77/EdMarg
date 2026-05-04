'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SessionFeedbackDialog from '@/components/student/SessionFeedbackDialog';
import { ChatModal } from '@/components/chat/ChatModal';

import { getImageUrl } from '@/utils/imageUrl';
import {
  Video,
  Clock,
  Calendar,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  MessageSquareText,
  MessageSquare,
  Star,
  FileText,
  CheckCircle,
  Circle
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
  sessionSummary?: string;
  actionItems?: { text: string; completed: boolean }[];
  recordingUrl?: string;
  reviewSubmitted?: boolean;
  review?: {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt?: string;
  } | null;
}

function HistoryContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [chatContact, setChatContact] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Fetch broader set to include sessions that may still be "in-progress"
        // but already have a recording URL attached.
        const response = await apiClient.get<{ bookings: Booking[] }>(
          '/api/v1/bookings/my-bookings?limit=50'
        );
        if (response.success && response.data?.bookings) {
          const historyBookings = response.data.bookings.filter(
            (booking) => booking.status === 'completed' || Boolean(booking.recordingUrl)
          );
          setBookings(historyBookings);
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

  const updateBookingReview = (bookingId: string, review: NonNullable<Booking['review']>) => {
    setBookings((current) =>
      current.map((booking) =>
        booking._id === bookingId
          ? {
              ...booking,
              reviewSubmitted: true,
              review,
            }
          : booking
      )
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <DashboardLayout userName={user?.name || "Session History"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Session History</h1>
            <p className="mt-2 text-sm text-gray-500">Review your past mentorship sessions and recordings.</p>
            <Link
              href="/student/recordings"
              className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-600 hover:underline"
            >
              Open recordings library
            </Link>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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

                  {/* Session Notes */}
                  {(booking.sessionSummary || (booking.actionItems && booking.actionItems.length > 0)) && (
                    <div className="mb-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">Mentor's Session Notes</h4>
                      </div>
                      
                      {booking.sessionSummary && (
                        <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
                          {booking.sessionSummary}
                        </p>
                      )}

                      {booking.actionItems && booking.actionItems.length > 0 && (
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Action Items</h5>
                          <ul className="space-y-2">
                            {booking.actionItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                {item.completed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                )}
                                <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                  {item.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {booking.reviewSubmitted && booking.review ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <MessageSquareText className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-bold text-slate-900">Your feedback</span>
                            </div>
                            {renderStars(booking.review.rating)}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600">{booking.review.comment}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="text-xs font-bold uppercase tracking-wide text-emerald-700 hover:text-emerald-900"
                          >
                            View review
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">How was this session?</p>
                            <p className="text-sm text-slate-500">Rate the meeting and share quick feedback with your mentor.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Rate meeting
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {booking.recordingUrl ? (
                    <Link
                      href={`/student/recordings/${booking._id}`}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Watch Session Recording
                    </Link>
                  ) : (
                    <div className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed">
                      No recording available
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setChatContact({ id: booking.mentor._id, name: booking.mentor.name })}
                    className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Mentor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <SessionFeedbackDialog
          bookingId={selectedBooking._id}
          mentorName={selectedBooking.mentor.name}
          isOpen={Boolean(selectedBooking)}
          existingReview={selectedBooking.review}
          onClose={() => setSelectedBooking(null)}
          onSubmitted={(review) => updateBookingReview(selectedBooking._id, review)}
        />
      )}

      {chatContact && (
        <ChatModal
          isOpen={Boolean(chatContact)}
          onClose={() => setChatContact(null)}
          contactId={chatContact.id}
          contactName={chatContact.name}
        />
      )}
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
