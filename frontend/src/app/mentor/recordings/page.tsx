'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Video,
  Calendar,
  Clock,
  User as UserIcon,
  AlertCircle,
  Upload,
  Film,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { getImageUrl } from '@/utils/imageUrl';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// ─── Types ──────────────────────────────────────────────────────────────────
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

// ─── Helpers ────────────────────────────────────────────────────────────────
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

// ─── Component ──────────────────────────────────────────────────────────────
function MentorRecordingsContent() {
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
          setRecordings(response.data.recordings);
        } else {
          setError(
            response.message || response.error || 'Failed to load recordings'
          );
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load recordings'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  return (
    <MentorDashboardLayout>
      <div className="min-h-screen pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1">
            Mentor Workspace
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/20">
                  <Film className="h-5 w-5 text-white" />
                </span>
                Session Recordings
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Browse and play back all your uploaded session recordings. Students can also watch these from their dashboard.
              </p>
            </div>

            <Link
              href="/mentor/requests?tab=past"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <Upload className="h-4 w-4" />
              Upload New
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading recordings...
              </p>
            </div>
          </div>
        ) : recordings.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4 border border-emerald-100">
              <Video className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No recordings yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
              Upload recordings from your completed sessions. They&apos;ll appear here and be accessible to your students.
            </p>
            <Link
              href="/mentor/requests?tab=past"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
            >
              <Upload className="h-4 w-4" />
              Go to Past Sessions
            </Link>
          </div>
        ) : (
          /* Recordings grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recordings.map((recording) => {
              const session = recording.sessionId;
              const student = recording.studentId;
              const isCompleted = recording.processingStatus === 'completed';
              const sessionIdStr =
                typeof session === 'object' ? session._id : String(session);

              return (
                <article
                  key={recording._id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgba(16,185,129,0.07)] hover:border-emerald-200/60 transition-all"
                >
                  <div className="p-6">
                    {/* Student info */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                        {student?.profileImage ? (
                          <Image
                            src={getImageUrl(
                              student.profileImage,
                              student.name
                            )}
                            alt={student.name}
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
                          {student?.name || 'Student'}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">
                          {student?.email || ''}
                        </p>
                      </div>
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        />
                        {isCompleted ? 'Ready' : recording.processingStatus}
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
                      {typeof session === 'object' &&
                        session.startTime &&
                        session.endTime && (
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
                    {isCompleted && (
                      <Link
                        href={`/sessions/${sessionIdStr}/recording`}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Watch Recording
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorRecordingsPage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorRecordingsContent />
    </ProtectedRoute>
  );
}
