'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video, Calendar, Clock, User as UserIcon, AlertCircle, Film } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { getImageUrl } from '@/utils/imageUrl';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface SessionInfo {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
}

interface RecordingItem {
  _id: string;
  sessionId: SessionInfo;
  mentorId: UserInfo;
  studentId: UserInfo;
  meetingId: string;
  duration: number;
  recordingType: string;
  processingStatus: string;
  fileSize: number;
  createdAt: string;
  videoUrl?: string;
}

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));

const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes <= 0) return '';
  if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
};

function RecordingsContent() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get<{ recordings: RecordingItem[] }>(
          '/api/v1/recordings'
        );
        if (response.success && response.data?.recordings) {
          // Only show completed recordings that have a video URL
          setRecordings(
            response.data.recordings.filter(
              (r) => r.processingStatus === 'completed' && r.videoUrl
            )
          );
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

  return (
    <DashboardLayout userName={user?.name || 'Recordings'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/20">
              <Film className="h-5 w-5 text-white" />
            </span>
            Session Recordings
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Watch your mentorship session recordings. Each session with your mentor has its own recording.
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
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
              <p className="mt-4 text-sm font-medium text-slate-500">Loading recordings...</p>
            </div>
          </div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No recordings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Completed sessions with recordings will appear here.
            </p>
            <Link
              href="/student/schedule"
              className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
            >
              Go to Schedule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recordings.map((recording) => {
              const session = recording.sessionId;
              const mentor = recording.mentorId;
              const sessionIdStr =
                typeof session === 'object' ? session._id : String(session);

              return (
                <article
                  key={recording._id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Mentor info */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                        {mentor?.profileImage ? (
                          <Image
                            src={getImageUrl(mentor.profileImage, mentor.name)}
                            alt={mentor.name}
                            width={48}
                            height={48}
                            className="object-cover object-top"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900">
                          {mentor?.name || 'Mentor'}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {mentor?.email || ''}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Ready
                      </span>
                    </div>

                    {/* Session meta */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-5">
                      {typeof session === 'object' && session.date && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(session.date)}
                        </div>
                      )}
                      {typeof session === 'object' && session.startTime && session.endTime && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {session.startTime} - {session.endTime}
                        </div>
                      )}
                      {recording.duration > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Video className="w-4 h-4 text-slate-400" />
                          {formatDuration(recording.duration)}
                        </div>
                      )}
                      {recording.fileSize > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Film className="w-4 h-4 text-slate-400" />
                          {formatFileSize(recording.fileSize)}
                        </div>
                      )}
                    </div>

                    {/* Watch button */}
                    <Link
                      href={`/student/recordings/${sessionIdStr}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Watch Recording
                    </Link>
                  </div>
                </article>
              );
            })}
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
