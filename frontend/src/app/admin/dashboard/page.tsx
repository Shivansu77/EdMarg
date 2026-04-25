/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  GraduationCap,
  ShieldCheck,
  UserCog,
  CheckCircle,
  XCircle,
  Clipboard,
  Download,
  CheckSquare,
  CalendarDays,
  BookOpen,
  Users,
  Video,
  RefreshCw,
  Activity,
  AlertTriangle,
  Clock,
} from 'lucide-react';

type DashboardStats = {
  totalStudents: number;
  approvedMentors: number;
  pendingMentors: number;
  totalUsers: number;
};

type BookingStats = {
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
  rejected?: number;
  'in-progress'?: number;
  [key: string]: number | undefined;
};

type Mentor = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  mentorProfile?: {
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    sessionDuration?: number;
    linkedinUrl?: string;
  };
};

type AssessmentSubmission = {
  _id: string;
  student?: {
    name?: string;
    email?: string;
    role?: string;
  };
  answers?: Record<string, unknown>;
  createdAt?: string;
};

type AdminRecording = {
  _id: string;
  processingStatus?: 'pending' | 'downloading' | 'uploading' | 'completed' | 'failed' | string;
  recordingType?: string;
  fileSize?: number;
  duration?: number;
  createdAt?: string;
  meetingId?: string;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  mentorId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  sessionId?: {
    _id?: string;
    sessionType?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    zoomMeetingId?: string;
  } | null;
};

type RecordingSummary = {
  total: number;
  completed: number;
  pending: number;
  downloading: number;
  uploading: number;
  failed: number;
  manualUploads: number;
  zoomCaptures: number;
  totalStorageBytes: number;
  averageDurationMinutes: number;
  recentNeedsAction: AdminRecording[];
};

const EMPTY_RECORDING_SUMMARY: RecordingSummary = {
  total: 0,
  completed: 0,
  pending: 0,
  downloading: 0,
  uploading: 0,
  failed: 0,
  manualUploads: 0,
  zoomCaptures: 0,
  totalStorageBytes: 0,
  averageDurationMinutes: 0,
  recentNeedsAction: [],
};

const NO_CACHE_HEADERS = {
  'x-bypass-cache': '1',
  'Cache-Control': 'no-cache',
} as const;

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  const digits = value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[index]}`;
};

const formatRelativeDate = (rawDate?: string) => {
  if (!rawDate) return '—';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatRecordingStatus = (status?: string) => {
  if (status === 'completed') return 'Ready';
  if (status === 'failed') return 'Failed';
  if (status === 'downloading') return 'Downloading';
  if (status === 'uploading') return 'Uploading';
  return 'Pending';
};

const recordingStatusClass = (status?: string) => {
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'failed') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (status === 'downloading' || status === 'uploading') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
};

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [recordingSummary, setRecordingSummary] = useState<RecordingSummary>(EMPTY_RECORDING_SUMMARY);

  const [pendingMentors, setPendingMentors] = useState<Mentor[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  const [assessments, setAssessments] = useState<AssessmentSubmission[]>([]);
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [assessmentPages, setAssessmentPages] = useState(1);
  const [assessmentTotal, setAssessmentTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [selectedMentors, setSelectedMentors] = useState<Set<string>>(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const loadDashboard = async (page: number) => {
    const statsRes = await apiClient.get<DashboardStats>('/api/v1/admin/stats', {
      headers: NO_CACHE_HEADERS,
    });
    const pendingRes = await apiClient.get<Mentor[]>(`/api/v1/admin/mentors/pending?page=${page}`, {
      headers: NO_CACHE_HEADERS,
    });
    const bookingStatsRes = await apiClient.get<BookingStats>('/api/v1/admin/bookings/stats', {
      headers: NO_CACHE_HEADERS,
    });

    if (!statsRes.success) throw new Error(statsRes.error || statsRes.message || 'Failed to fetch stats');
    if (!pendingRes.success) throw new Error(pendingRes.error || pendingRes.message || 'Failed to fetch pending mentors');

    setStats(statsRes.data || null);
    setBookingStats(bookingStatsRes.success ? (bookingStatsRes.data ?? null) : null);
    setPendingMentors(pendingRes.data || []);
    setPendingPage(pendingRes.page || page);
    setPendingPages(pendingRes.pages || 1);
    setPendingTotal(pendingRes.total || 0);
    setSelectedMentors(new Set());
  };

  const loadAssessments = async (page: number) => {
    const assessmentsRes = await apiClient.get<AssessmentSubmission[]>(
      `/api/v1/admin/assessments?page=${page}&limit=10`,
      { headers: NO_CACHE_HEADERS }
    );
    if (!assessmentsRes.success) {
      throw new Error(assessmentsRes.error || assessmentsRes.message || 'Failed to fetch assessments');
    }

    setAssessments(assessmentsRes.data || []);
    setAssessmentPage(assessmentsRes.page || page);
    setAssessmentPages(assessmentsRes.pages || 1);
    setAssessmentTotal(assessmentsRes.total || 0);
  };

  const loadRecordingSummary = async () => {
    const res = await apiClient.get<AdminRecording[]>('/api/v1/admin/recordings', {
      params: {
        page: 1,
        limit: 50,
        status: 'all',
        type: 'all',
        search: '',
        sortField: 'date',
        sortAsc: false,
      },
      headers: NO_CACHE_HEADERS,
    });

    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to fetch recording snapshot');
    }

    const rows = res.data || [];
    const summary = rows.reduce<RecordingSummary>(
      (acc, recording) => {
        const status = String(recording.processingStatus || 'pending');

        if (status === 'completed') acc.completed += 1;
        else if (status === 'failed') acc.failed += 1;
        else if (status === 'downloading') acc.downloading += 1;
        else if (status === 'uploading') acc.uploading += 1;
        else acc.pending += 1;

        if (recording.recordingType === 'manual_upload') acc.manualUploads += 1;
        else acc.zoomCaptures += 1;

        acc.totalStorageBytes += Number(recording.fileSize || 0);

        if (Number(recording.duration || 0) > 0) {
          acc.averageDurationMinutes += Number(recording.duration || 0) / 60;
        }

        return acc;
      },
      {
        total: Number(res.total || rows.length),
        completed: 0,
        pending: 0,
        downloading: 0,
        uploading: 0,
        failed: 0,
        manualUploads: 0,
        zoomCaptures: 0,
        totalStorageBytes: 0,
        averageDurationMinutes: 0,
        recentNeedsAction: rows.filter((item) => item.processingStatus !== 'completed').slice(0, 5),
      }
    );

    const completedRows = rows.filter((item) => Number(item.duration || 0) > 0);
    summary.averageDurationMinutes = completedRows.length
      ? Number((summary.averageDurationMinutes / completedRows.length).toFixed(1))
      : 0;

    setRecordingSummary(summary);
  };

  const loadAll = async (showLoader: boolean) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      await Promise.all([
        loadDashboard(pendingPage),
        loadAssessments(assessmentPage),
        loadRecordingSummary(),
      ]);

      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAll(true);
  }, [pendingPage, assessmentPage]);

  const totalSessions = useMemo(() => {
    if (!bookingStats) return 0;
    return Object.values(bookingStats).reduce<number>((sum, value) => sum + Number(value || 0), 0);
  }, [bookingStats]);

  const completedSessions = Number(bookingStats?.completed || 0);
  const pendingSessions = Number(bookingStats?.pending || 0);
  const inProgressSessions = Number(bookingStats?.['in-progress'] || 0);
  const confirmedSessions = Number(bookingStats?.confirmed || 0);
  const cancelledSessions = Number(bookingStats?.cancelled || 0) + Number(bookingStats?.rejected || 0);
  const activeQueue = pendingSessions + confirmedSessions + inProgressSessions;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const cancellationRate = totalSessions > 0 ? Math.round((cancelledSessions / totalSessions) * 100) : 0;
  const processingRecordings =
    recordingSummary.pending + recordingSummary.downloading + recordingSummary.uploading;

  const adminStats = [
    {
      label: 'Students Active',
      value: stats?.totalStudents || '0',
      icon: GraduationCap,
      href: '/admin/users',
    },
    {
      label: 'Mentors Verified',
      value: stats?.approvedMentors || '0',
      icon: ShieldCheck,
      href: '/admin/users?tab=mentor',
    },
    {
      label: 'Pending Approval',
      value: stats?.pendingMentors || '0',
      icon: UserCog,
      href: '/admin/users?tab=mentor',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || '0',
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Total Sessions',
      value: totalSessions || '0',
      icon: CalendarDays,
      href: '/admin/bookings',
    },
    {
      label: 'Recordings Tracked',
      value: recordingSummary.total || '0',
      icon: Video,
      href: '/admin/recordings',
    },
  ];

  const runRefresh = async () => {
    setIsRefreshing(true);
    await loadAll(false);
  };

  const handleApproveMentor = async (mentorId: string) => {
    try {
      const res = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/approve`, {});
      if (res.success) {
        setPendingPage(1);
        await Promise.all([loadDashboard(1), loadRecordingSummary()]);
        setLastUpdatedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Error approving mentor:', err);
    }
  };

  const handleRejectMentor = async (mentorId: string, mentorName: string) => {
    const shouldReject = window.confirm(`Are you sure you want to reject ${mentorName}'s mentor request?`);
    if (!shouldReject) return;

    try {
      const res = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/reject`, {
        reason: 'Rejected by admin',
      });

      if (res.success) {
        setPendingPage(1);
        await Promise.all([loadDashboard(1), loadRecordingSummary()]);
        setLastUpdatedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error('Error rejecting mentor:', err);
    }
  };

  const toggleAllMentors = () => {
    if (selectedMentors.size === pendingMentors.length && pendingMentors.length > 0) {
      setSelectedMentors(new Set());
    } else {
      setSelectedMentors(new Set(pendingMentors.map((mentor) => mentor._id)));
    }
  };

  const toggleMentor = (id: string) => {
    const next = new Set(selectedMentors);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMentors(next);
  };

  const handleBulkApprove = async () => {
    if (!selectedMentors.size) return;

    setIsProcessingBulk(true);
    try {
      await Promise.all(
        Array.from(selectedMentors).map((id) => apiClient.put(`/api/v1/admin/mentors/${id}/approve`, {}))
      );
      setSelectedMentors(new Set());
      setPendingPage(1);
      await Promise.all([loadDashboard(1), loadRecordingSummary()]);
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      console.error('Error in bulk approval:', err);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkReject = async () => {
    if (!selectedMentors.size) return;

    const shouldReject = window.confirm(
      `Are you sure you want to reject ${selectedMentors.size} selected mentor request(s)?`
    );

    if (!shouldReject) return;

    setIsProcessingBulk(true);
    try {
      await Promise.all(
        Array.from(selectedMentors).map((id) =>
          apiClient.put(`/api/v1/admin/mentors/${id}/reject`, { reason: 'Bulk rejected by admin' })
        )
      );
      setSelectedMentors(new Set());
      setPendingPage(1);
      await Promise.all([loadDashboard(1), loadRecordingSummary()]);
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      console.error('Error in bulk rejection:', err);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const exportAssessmentsToCSV = () => {
    if (!assessments.length) return;

    const headers = ['Student Name', 'Student Email', 'Responses Logged', 'Submission Date'];
    const csvRows = [headers.join(',')];

    assessments.forEach((submission) => {
      const answers = submission.answers || {};
      const keys = typeof answers === 'object' && answers ? Object.keys(answers) : [];
      const name = `"${(submission.student?.name || 'Unknown').replace(/"/g, '""')}"`;
      const email = `"${(submission.student?.email || '').replace(/"/g, '""')}"`;
      const date = submission.createdAt ? `"${new Date(submission.createdAt).toLocaleDateString()}"` : '""';
      csvRows.push([name, email, keys.length, date].join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `edmarg_assessments_${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-8 pb-16 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-8 sm:px-8">
          <div className="max-w-7xl flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Admin Control Center</p>
              <h1 className="text-4xl font-bold text-black">Platform Overview</h1>
              <p className="mt-2 text-gray-600">
                Manage mentor approvals, monitor recording health, and track platform-wide operations.
              </p>
              {lastUpdatedAt && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Clock size={12} /> Last updated {formatRelativeDate(lastUpdatedAt)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0 items-center">
              <button
                onClick={runRefresh}
                disabled={isRefreshing || loading}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 disabled:opacity-60"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh Data
              </button>
              <Link href="/admin/users">
                <button className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 active:scale-95">
                  <Users size={16} />
                  Users
                </button>
              </Link>
              <Link href="/admin/bookings">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
                  <CalendarDays size={16} />
                  Sessions
                </button>
              </Link>
              <Link href="/admin/blogs">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
                  <BookOpen size={16} />
                  Blogs
                </button>
              </Link>
              <Link href="/admin/recordings">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
                  <Video size={16} />
                  Recordings
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-center gap-3 shadow-sm">
              <XCircle className="text-red-500" size={24} />
              <div>
                <p className="font-bold text-red-900">Error</p>
                <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block relative">
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
                  <div className="w-12 h-12 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
                </div>
                <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6">
                {adminStats.map((stat) => (
                  <Link key={stat.label} href={stat.href}>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-black hover:shadow-xl flex flex-col cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-black shadow-sm transition-transform group-hover:scale-110 border border-gray-200">
                          <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
                          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-black">{stat.value}</h2>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Session Completion</p>
                  <p className="mt-2 text-3xl font-black text-emerald-900">{completionRate}%</p>
                  <p className="mt-1 text-sm text-emerald-700">{completedSessions} completed out of {totalSessions || 0}</p>
                </div>

                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Active Queue</p>
                  <p className="mt-2 text-3xl font-black text-sky-900">{activeQueue}</p>
                  <p className="mt-1 text-sm text-sky-700">
                    Pending + confirmed + in-progress sessions. Cancel rate: {cancellationRate}%
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-700">Recording Risk</p>
                  <p className="mt-2 text-3xl font-black text-rose-900">{recordingSummary.failed + processingRecordings}</p>
                  <p className="mt-1 text-sm text-rose-700">{recordingSummary.failed} failed, {processingRecordings} in pipeline</p>
                </div>

                <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Vault Storage</p>
                  <p className="mt-2 text-3xl font-black text-violet-900">{formatBytes(recordingSummary.totalStorageBytes)}</p>
                  <p className="mt-1 text-sm text-violet-700">Avg duration {recordingSummary.averageDurationMinutes} min</p>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-white px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">Recording Health Watchlist</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Latest uploads that are still in progress or failed.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                      <Activity size={12} /> {processingRecordings} processing
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-rose-700">
                      <AlertTriangle size={12} /> {recordingSummary.failed} failed
                    </span>
                    <Link href="/admin/recordings" className="text-sm font-bold text-slate-700 hover:text-black">
                      Open Vault →
                    </Link>
                  </div>
                </div>

                {recordingSummary.recentNeedsAction.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-12 text-center m-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
                      <CheckCircle className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="mt-2 text-lg font-extrabold text-emerald-900">No recording incidents right now</h3>
                    <p className="mt-1 text-sm font-medium text-emerald-700">All recent recordings are ready for playback.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 text-left border-y border-gray-200">
                          <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Meeting</th>
                          <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Participants</th>
                          <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                          <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Uploaded</th>
                          <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recordingSummary.recentNeedsAction.map((recording) => (
                          <tr key={recording._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3">
                              <div className="text-sm font-bold text-slate-900">{recording.meetingId || recording.sessionId?.zoomMeetingId || '—'}</div>
                              <div className="text-xs text-slate-500">{recording.recordingType || 'Unknown type'}</div>
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-700">
                              <div>{recording.studentId?.name || 'Unknown student'}</div>
                              <div className="text-xs text-slate-500">with {recording.mentorId?.name || 'Unknown mentor'}</div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${recordingStatusClass(recording.processingStatus)}`}>
                                {formatRecordingStatus(recording.processingStatus)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-600">{formatRelativeDate(recording.createdAt)}</td>
                            <td className="px-6 py-3 text-right">
                              <Link href="/admin/recordings">
                                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">
                                  Review
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm relative z-20">
                <div className="border-b border-gray-200 bg-white px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">Pending Mentor Approvals</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      <span className="text-black font-bold">{pendingTotal}</span> applications awaiting review
                    </p>
                  </div>
                  {selectedMentors.size > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <span className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-300">
                        {selectedMentors.size} selected
                      </span>
                      <button
                        onClick={handleBulkApprove}
                        disabled={isProcessingBulk}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                      >
                        <CheckSquare size={16} />
                        Approve All
                      </button>
                      <button
                        onClick={handleBulkReject}
                        disabled={isProcessingBulk}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject All
                      </button>
                    </div>
                  )}
                </div>

                {pendingMentors.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-20 text-center m-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ring-8 ring-gray-50/50">
                      <UserCog className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-gray-900">All caught up!</h3>
                    <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">
                      No new mentor registrations require approval.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 text-left border-y border-gray-200">
                          <th className="px-6 py-4 w-12">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                              checked={pendingMentors.length > 0 && selectedMentors.size === pendingMentors.length}
                              onChange={toggleAllMentors}
                            />
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Mentor Details</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Expertise</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingMentors.map((mentor) => (
                          <tr key={mentor._id} className="group transition-colors hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                checked={selectedMentors.has(mentor._id)}
                                onChange={() => toggleMentor(mentor._id)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 text-black font-bold flex items-center justify-center">
                                  {mentor.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{mentor.name}</div>
                                  <div className="text-xs text-gray-500 font-medium mt-0.5">{mentor.email}</div>
                                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                                    {mentor.phoneNumber || 'Phone not provided'}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium mt-1 flex flex-wrap items-center gap-2">
                                    {mentor.mentorProfile?.linkedinUrl ? (
                                      <a
                                        href={mentor.mentorProfile.linkedinUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-700 transition-colors hover:bg-cyan-100"
                                      >
                                        linkedin
                                      </a>
                                    ) : (
                                      <span className="text-gray-400">linkedin missing</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                                    Applied {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : '—'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {mentor.mentorProfile?.expertise?.slice(0, 3).map((expertise) => (
                                  <span
                                    key={expertise}
                                    className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold text-gray-700"
                                  >
                                    {expertise}
                                  </span>
                                )) || <span className="text-gray-400 font-medium text-sm">—</span>}
                              </div>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div>Experience: {mentor.mentorProfile?.experienceYears ?? 0} years</div>
                                <div>Fee: {mentor.mentorProfile?.pricePerSession ?? 0} / session</div>
                                <div>Duration: {mentor.mentorProfile?.sessionDuration ?? 45} min</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApproveMentor(mentor._id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-95"
                                >
                                  <CheckCircle size={14} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectMentor(mentor._id, mentor.name)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50/50 p-4">
                  <button
                    onClick={() => setPendingPage((value) => Math.max(1, value - 1))}
                    disabled={pendingPage <= 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-gray-900 mx-2">Page {pendingPage} of {pendingPages}</span>
                  <button
                    onClick={() => setPendingPage((value) => Math.min(pendingPages, value + 1))}
                    disabled={pendingPage >= pendingPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-white px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-5 h-5 text-gray-900" />
                      <h2 className="text-xl font-bold text-black">Recent Assessments</h2>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      <span className="text-black font-bold">{assessmentTotal}</span> total submissions tracked
                    </p>
                  </div>
                  {assessments.length > 0 && (
                    <button
                      onClick={exportAssessmentsToCSV}
                      className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:text-black active:scale-95"
                    >
                      <Download size={16} />
                      Export to CSV
                    </button>
                  )}
                </div>

                {assessments.length === 0 ? (
                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-20 text-center m-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ring-8 ring-gray-50/50">
                      <Clipboard className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-gray-900">No submissions yet</h3>
                    <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">
                      Submissions will appear here as students complete them.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/80 text-left border-y border-gray-200">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Student</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Responses</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Date Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {assessments.map((submission) => {
                            const answers = submission.answers || {};
                            const keys = typeof answers === 'object' && answers ? Object.keys(answers) : [];
                            return (
                              <tr key={submission._id} className="group transition-colors hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-bold text-gray-900">{submission.student?.name || 'Unknown Student'}</div>
                                    <div className="text-xs text-gray-500 font-medium mt-0.5">{submission.student?.email || '—'}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs font-bold text-black">
                                    {keys.length} Data Points
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                  {submission.createdAt
                                    ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50/50 p-4">
                      <button
                        onClick={() => setAssessmentPage((value) => Math.max(1, value - 1))}
                        disabled={assessmentPage <= 1}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-gray-900 mx-2">Page {assessmentPage} of {assessmentPages}</span>
                      <button
                        onClick={() => setAssessmentPage((value) => Math.min(assessmentPages, value + 1))}
                        disabled={assessmentPage >= assessmentPages}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
