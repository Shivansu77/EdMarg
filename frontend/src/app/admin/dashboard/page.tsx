/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/common/ProtectedRoute';
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
  Users,
  Video,
  RefreshCw,
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
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
  studentId?: { _id?: string; name?: string; email?: string };
  mentorId?: { _id?: string; name?: string; email?: string };
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
  total: 0, completed: 0, pending: 0, downloading: 0, uploading: 0, failed: 0,
  manualUploads: 0, zoomCaptures: 0, totalStorageBytes: 0, averageDurationMinutes: 0,
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
  while (value >= 1024 && index < units.length - 1) { value /= 1024; index += 1; }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
};

const formatRelativeDate = (rawDate?: string) => {
  if (!rawDate) return '—';
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
  if (status === 'downloading' || status === 'uploading') return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-[var(--color-surface-dim)] ${className}`} />
);

// ── Empty State ───────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="py-20 flex flex-col items-center justify-center text-center px-6">
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary-container)]/40 mb-5">
      <Icon className="w-7 h-7 text-[var(--color-primary-fixed-dim)]" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold text-[var(--color-on-surface)]">{title}</h3>
    <p className="mt-1.5 text-sm text-[var(--color-on-surface-variant)] max-w-xs">{subtitle}</p>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, href, trend,
}: {
  label: string; value: string | number; icon: React.ElementType; href: string; trend?: { value: string; positive: boolean };
}) => (
  <Link href={href} className="group block">
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-5 transition-all duration-200 hover:border-[var(--color-primary)]/20 hover:shadow-[0_4px_24px_rgba(78,69,226,0.06)]">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium tracking-wider uppercase text-[var(--color-on-surface-variant)]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-on-surface)] tabular-nums">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{trend.value}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-container)]/40 group-hover:bg-[var(--color-primary-container)]/70 transition-colors">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  </Link>
);

// ── Mini Summary Pill ─────────────────────────────────────────
const SummaryPill = ({ label, value, color }: { label: string; value: number | string; color: 'emerald' | 'sky' | 'rose' | 'violet' }) => {
  const palette = {
    emerald: 'border-emerald-200 bg-emerald-50/60 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50/60 text-sky-700',
    rose: 'border-rose-200 bg-rose-50/60 text-rose-700',
    violet: 'border-violet-200 bg-violet-50/60 text-violet-700',
  };
  return (
    <div className={`flex flex-col items-center rounded-xl border px-4 py-3 ${palette[color]}`}>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[11px] font-medium tracking-wide uppercase mt-0.5 opacity-80">{label}</span>
    </div>
  );
};

// ── Main Content ──────────────────────────────────────────────
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
    const statsRes = await apiClient.get<DashboardStats>('/api/v1/admin/stats', { headers: NO_CACHE_HEADERS });
    const pendingRes = await apiClient.get<Mentor[]>(`/api/v1/admin/mentors/pending?page=${page}`, { headers: NO_CACHE_HEADERS });
    const bookingStatsRes = await apiClient.get<BookingStats>('/api/v1/admin/bookings/stats', { headers: NO_CACHE_HEADERS });
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
    const res = await apiClient.get<AssessmentSubmission[]>(
      `/api/v1/admin/assessments?page=${page}&limit=10`,
      { headers: NO_CACHE_HEADERS }
    );
    if (!res.success) throw new Error(res.error || res.message || 'Failed to fetch assessments');
    setAssessments(res.data || []);
    setAssessmentPage(res.page || page);
    setAssessmentPages(res.pages || 1);
    setAssessmentTotal(res.total || 0);
  };

  const loadRecordingSummary = async () => {
    const res = await apiClient.get<AdminRecording[]>('/api/v1/admin/recordings', {
      params: { page: 1, limit: 50, status: 'all', type: 'all', search: '', sortField: 'date', sortAsc: false },
      headers: NO_CACHE_HEADERS,
    });
    if (!res.success) throw new Error(res.error || res.message || 'Failed to fetch recording snapshot');
    const rows = res.data || [];
    const summary = rows.reduce<RecordingSummary>(
      (acc, rec) => {
        const s = String(rec.processingStatus || 'pending');
        if (s === 'completed') acc.completed += 1;
        else if (s === 'failed') acc.failed += 1;
        else if (s === 'downloading') acc.downloading += 1;
        else if (s === 'uploading') acc.uploading += 1;
        else acc.pending += 1;
        if (rec.recordingType === 'manual_upload') acc.manualUploads += 1;
        else acc.zoomCaptures += 1;
        acc.totalStorageBytes += Number(rec.fileSize || 0);
        if (Number(rec.duration || 0) > 0) acc.averageDurationMinutes += Number(rec.duration || 0) / 60;
        return acc;
      },
      { ...EMPTY_RECORDING_SUMMARY, total: Number(res.total || rows.length) }
    );
    const completedRows = rows.filter(r => Number(r.duration || 0) > 0);
    summary.averageDurationMinutes = completedRows.length ? +(summary.averageDurationMinutes / completedRows.length).toFixed(1) : 0;
    summary.recentNeedsAction = rows.filter(r => r.processingStatus !== 'completed').slice(0, 5);
    setRecordingSummary(summary);
  };

  const loadAll = async (showLoader: boolean) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      await Promise.all([loadDashboard(pendingPage), loadAssessments(assessmentPage), loadRecordingSummary()]);
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (showLoader) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { void loadAll(true); }, []);

  const totalSessions = useMemo(() => {
    if (!bookingStats) return 0;
    return Object.values(bookingStats).reduce<number>((sum, v) => sum + Number(v || 0), 0);
  }, [bookingStats]);

  const completedSessions = Number(bookingStats?.completed || 0);
  const pendingSessions = Number(bookingStats?.pending || 0);
  const inProgressSessions = Number(bookingStats?.['in-progress'] || 0);
  const confirmedSessions = Number(bookingStats?.confirmed || 0);
  const activeQueue = pendingSessions + confirmedSessions + inProgressSessions;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const processingRecordings = recordingSummary.pending + recordingSummary.downloading + recordingSummary.uploading;

  const runRefresh = async () => { setIsRefreshing(true); await loadAll(false); };

  const handleApprove = async (mentorId: string) => {
    try { setError(null); const r = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/approve`, {}); if (!r.success) { setError(r.error || r.message || 'Failed'); return; } setPendingPage(1); await Promise.all([loadDashboard(1), loadRecordingSummary()]); setLastUpdatedAt(new Date().toISOString()); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleReject = async (mentorId: string, mentorName: string) => {
    if (!window.confirm(`Reject ${mentorName}?`)) return;
    try { setError(null); const r = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/reject`, { reason: 'Rejected by admin' }); if (!r.success) { setError(r.error || r.message || 'Failed'); return; } setPendingPage(1); await Promise.all([loadDashboard(1), loadRecordingSummary()]); setLastUpdatedAt(new Date().toISOString()); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
  };

  const toggleAll = () => setSelectedMentors(pendingMentors.length > 0 && selectedMentors.size === pendingMentors.length ? new Set() : new Set(pendingMentors.map(m => m._id)));
  const toggleOne = (id: string) => {
    const next = new Set(selectedMentors);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMentors(next);
  };

  const bulkApprove = async () => { if (!selectedMentors.size) return; setIsProcessingBulk(true); try { setError(null); const rr = await Promise.all(Array.from(selectedMentors).map(id => apiClient.put(`/api/v1/admin/mentors/${id}/approve`, {}))); if (rr.some(r => !r.success)) { setError('Some approvals failed'); return; } setSelectedMentors(new Set()); setPendingPage(1); await Promise.all([loadDashboard(1), loadRecordingSummary()]); setLastUpdatedAt(new Date().toISOString()); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setIsProcessingBulk(false); } };

  const bulkReject = async () => { if (!selectedMentors.size) return; if (!window.confirm(`Reject ${selectedMentors.size} mentor(s)?`)) return; setIsProcessingBulk(true); try { setError(null); const rr = await Promise.all(Array.from(selectedMentors).map(id => apiClient.put(`/api/v1/admin/mentors/${id}/reject`, { reason: 'Bulk rejected by admin' }))); if (rr.some(r => !r.success)) { setError('Some rejections failed'); return; } setSelectedMentors(new Set()); setPendingPage(1); await Promise.all([loadDashboard(1), loadRecordingSummary()]); setLastUpdatedAt(new Date().toISOString()); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setIsProcessingBulk(false); } };

  const exportCSV = () => {
    if (!assessments.length) return;
    const rows = [['Student Name', 'Student Email', 'Responses', 'Submission Date'].join(',')];
    assessments.forEach(s => { const k = Object.keys(s.answers || {}); rows.push([`"${(s.student?.name || 'Unknown').replace(/"/g, '""')}"`, `"${(s.student?.email || '').replace(/"/g, '""')}"`, k.length, s.createdAt ? `"${new Date(s.createdAt).toLocaleDateString()}"` : '""'].join(',')); });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `edmarg_assessments_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <DashboardLayout userName="Admin Team">
      <div className="pb-16">

        {/* ── Hero Header ── */}
        <div className="mb-8">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-1">Admin Control Center</p>
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)] tracking-tight">Platform Overview</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-[var(--color-on-surface-variant)]">Manage mentor approvals, monitor recordings, and track platform-wide operations.</p>
            {lastUpdatedAt && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] px-3 py-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                <Clock size={12} /> Updated {formatRelativeDate(lastUpdatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <button onClick={runRefresh} disabled={isRefreshing || loading} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-4 py-2.5 text-sm font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md disabled:opacity-50">
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link href="/admin/users" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--color-primary-dim)] hover:shadow-md">Users</Link>
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-4 py-2.5 text-sm font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:border-[var(--color-primary)]/30">Sessions</Link>
          <Link href="/admin/blogs" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-4 py-2.5 text-sm font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:border-[var(--color-primary)]/30">Blogs</Link>
          <Link href="/admin/recordings" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-4 py-2.5 text-sm font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:border-[var(--color-primary)]/30">Recordings</Link>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div><p className="text-sm font-semibold text-rose-800">Error loading data</p><p className="mt-0.5 text-sm text-rose-600">{error}</p></div>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[96px]" />)}
            </div>
            <Skeleton className="h-[320px]" />
            <Skeleton className="h-[420px]" />
            <Skeleton className="h-[320px]" />
          </div>
        ) : (
          <>
            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-8">
              <StatCard label="Students Active" value={stats?.totalStudents ?? '0'} icon={GraduationCap} href="/admin/users" />
              <StatCard label="Mentors Verified" value={stats?.approvedMentors ?? '0'} icon={ShieldCheck} href="/admin/users" />
              <StatCard label="Pending Approval" value={stats?.pendingMentors ?? '0'} icon={UserCog} href="/admin/users" trend={stats?.pendingMentors && stats.pendingMentors > 0 ? { value: `${stats.pendingMentors} need review`, positive: false } : undefined} />
              <StatCard label="Total Users" value={stats?.totalUsers ?? '0'} icon={Users} href="/admin/users" />
              <StatCard label="Total Sessions" value={totalSessions || '0'} icon={CalendarDays} href="/admin/bookings" />
              <StatCard label="Recordings" value={recordingSummary.total || '0'} icon={Video} href="/admin/recordings" />
            </div>

            {/* ── Session Health ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
              <SummaryPill label="Completion Rate" value={`${completionRate}%`} color="emerald" />
              <SummaryPill label="Active Queue" value={activeQueue} color="sky" />
              <SummaryPill label="Recording Risk" value={recordingSummary.failed + processingRecordings} color="rose" />
              <SummaryPill label="Vault Storage" value={formatBytes(recordingSummary.totalStorageBytes)} color="violet" />
            </div>

            {/* ── Recording Watchlist ── */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-[var(--color-outline-variant)]/15">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">Recording Health Watchlist</h2>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Uploads still processing or requiring attention.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase text-amber-700">
                    <Activity size={11} /> {processingRecordings} processing
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase text-rose-700">
                    <AlertTriangle size={11} /> {recordingSummary.failed} failed
                  </span>
                  <Link href="/admin/recordings" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dim)] transition-colors">Open Vault →</Link>
                </div>
              </div>

              {recordingSummary.recentNeedsAction.length === 0 ? (
                <EmptyState icon={CheckCircle} title="All recordings are healthy" subtitle="No recordings currently require attention." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/50">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Meeting</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Participants</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Status</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Uploaded</th>
                      <th className="px-6 py-3" />
                    </tr></thead>
                    <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                      {recordingSummary.recentNeedsAction.map(r => (
                        <tr key={r._id} className="hover:bg-[var(--color-surface-container-low)]/30 transition-colors">
                          <td className="px-6 py-3.5"><div className="text-sm font-medium text-[var(--color-on-surface)]">{r.meetingId || r.sessionId?.zoomMeetingId || '—'}</div><div className="text-xs text-[var(--color-on-surface-variant)]">{r.recordingType || 'Unknown type'}</div></td>
                          <td className="px-6 py-3.5 text-sm text-[var(--color-on-surface)]">{r.studentId?.name || 'Unknown student'}<div className="text-xs text-[var(--color-on-surface-variant)]">with {r.mentorId?.name || 'Unknown mentor'}</div></td>
                          <td className="px-6 py-3.5"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${recordingStatusClass(r.processingStatus)}`}>{formatRecordingStatus(r.processingStatus)}</span></td>
                          <td className="px-6 py-3.5 text-sm text-[var(--color-on-surface-variant)]">{formatRelativeDate(r.createdAt)}</td>
                          <td className="px-6 py-3.5 text-right"><Link href="/admin/recordings" className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3 py-1.5 text-xs font-medium text-[var(--color-on-surface)] hover:border-[var(--color-primary)]/30 transition-colors">Review</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Pending Mentors ── */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-[var(--color-outline-variant)]/15">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">Pending Mentor Approvals</h2>
                  <p className="text-sm text-[var(--color-on-surface-variant)]"><span className="font-semibold text-[var(--color-on-surface)]">{pendingTotal}</span> applications awaiting review</p>
                </div>
                <AnimatePresence>
                  {selectedMentors.size > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-low)] px-3 py-1 rounded-lg">{selectedMentors.size} selected</span>
                      <button onClick={bulkApprove} disabled={isProcessingBulk} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[var(--color-primary-dim)] disabled:opacity-50">
                        <CheckSquare size={13} /> Approve All
                      </button>
                      <button onClick={bulkReject} disabled={isProcessingBulk} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-2 text-xs font-semibold text-[var(--color-on-surface)] transition-all hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50">
                        <XCircle size={13} /> Reject All
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {pendingMentors.length === 0 ? (
                <EmptyState icon={UserCog} title="All caught up!" subtitle="No new mentor registrations require approval." />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/50">
                        <th className="px-6 py-3 w-12"><input type="checkbox" className="w-4 h-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] cursor-pointer" checked={pendingMentors.length > 0 && selectedMentors.size === pendingMentors.length} onChange={toggleAll} /></th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Mentor</th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Expertise</th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                        {pendingMentors.map(m => (
                          <tr key={m._id} className="hover:bg-[var(--color-surface-container-low)]/30 transition-colors">
                            <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] cursor-pointer" checked={selectedMentors.has(m._id)} onChange={() => toggleOne(m._id)} /></td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-[var(--color-primary-container)]/60 text-[var(--color-on-primary-container)] font-semibold text-sm flex items-center justify-center shrink-0">{m.name.charAt(0)}</div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-[var(--color-on-surface)]">{m.name}</div>
                                  <div className="text-xs text-[var(--color-on-surface-variant)]">{m.email}{m.phoneNumber ? ` · ${m.phoneNumber}` : ''}</div>
                                  <div className="mt-1 flex items-center gap-2">
                                    {m.mentorProfile?.linkedinUrl ? (
                                      <a href={m.mentorProfile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700 hover:bg-sky-100 transition-colors">
                                        LinkedIn <ExternalLink size={9} />
                                      </a>
                                    ) : <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60">No LinkedIn</span>}
                                  </div>
                                  <div className="text-[11px] text-[var(--color-on-surface-variant)] mt-0.5 opacity-70">Applied {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {m.mentorProfile?.expertise?.slice(0, 3).map(e => (
                                  <span key={e} className="rounded-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-on-surface-variant)]">{e}</span>
                                )) || <span className="text-xs text-[var(--color-on-surface-variant)] opacity-50">—</span>}
                              </div>
                              <div className="text-[11px] text-[var(--color-on-surface-variant)] space-y-0.5">
                                <div>{m.mentorProfile?.experienceYears ?? 0}y exp · ₹{m.mentorProfile?.pricePerSession ?? 0}/session · {m.mentorProfile?.sessionDuration ?? 45}min</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleApprove(m._id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--color-primary-dim)]">
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button onClick={() => handleReject(m._id, m.name)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3 py-1.5 text-xs font-semibold text-[var(--color-on-surface)] transition-all hover:border-rose-200 hover:bg-rose-50">
                                  <XCircle size={13} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-center gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/30 px-6 py-3">
                    <button onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage <= 1} className="rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-30 transition-colors">Prev</button>
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">Page {pendingPage} of {pendingPages || 1}</span>
                    <button onClick={() => setPendingPage(p => Math.min(pendingPages || 1, p + 1))} disabled={pendingPage >= (pendingPages || 1)} className="rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-30 transition-colors">Next</button>
                  </div>
                </>
              )}
            </section>

            {/* ── Recent Assessments ── */}
            <section className="overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-[var(--color-outline-variant)]/15">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">Recent Assessments</h2>
                  <p className="text-sm text-[var(--color-on-surface-variant)]"><span className="font-semibold text-[var(--color-on-surface)]">{assessmentTotal}</span> total submissions</p>
                </div>
                {assessments.length > 0 && (
                  <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-2 text-xs font-semibold text-[var(--color-on-surface)] transition-all hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]">
                    <Download size={13} /> Export CSV
                  </button>
                )}
              </div>

              {assessments.length === 0 ? (
                <EmptyState icon={Clipboard} title="No submissions yet" subtitle="Assessments will appear here as students complete them." />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/50">
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Student</th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Responses</th>
                        <th className="px-6 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-surface-variant)]">Submitted</th>
                      </tr></thead>
                      <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                        {assessments.map(s => {
                          const keys = Object.keys(s.answers || {});
                          return (
                            <tr key={s._id} className="hover:bg-[var(--color-surface-container-low)]/30 transition-colors">
                              <td className="px-6 py-4"><div className="text-sm font-medium text-[var(--color-on-surface)]">{s.student?.name || 'Unknown'}</div><div className="text-xs text-[var(--color-on-surface-variant)]">{s.student?.email || '—'}</div></td>
                              <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-[var(--color-primary-container)]/60 px-2.5 py-1 text-xs font-semibold text-[var(--color-on-primary-container)]">{keys.length} data points</span></td>
                              <td className="px-6 py-4 text-sm text-[var(--color-on-surface-variant)]">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-center gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/30 px-6 py-3">
                    <button onClick={() => setAssessmentPage(p => Math.max(1, p - 1))} disabled={assessmentPage <= 1} className="rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-30 transition-colors">Prev</button>
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">Page {assessmentPage} of {assessmentPages || 1}</span>
                    <button onClick={() => setAssessmentPage(p => Math.min(assessmentPages || 1, p + 1))} disabled={assessmentPage >= (assessmentPages || 1)} className="rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] disabled:opacity-30 transition-colors">Next</button>
                  </div>
                </>
              )}
            </section>
          </>
        )}
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
