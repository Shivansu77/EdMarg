/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCallback, useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  CalendarDays, Search, Filter, X, CheckCircle2,
  Clock, XCircle, AlertCircle, RefreshCw, Ban, ChevronLeft, ChevronRight,
} from 'lucide-react';

type BookingUser = { _id: string; name: string; email: string };
type Booking = {
  _id: string;
  student?: BookingUser;
  mentor?: BookingUser;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  sessionType: string;
  price: number;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
};

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  pending:     { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  icon: Clock },
  confirmed:   { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400',   icon: CheckCircle2 },
  'in-progress':{ bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', icon: RefreshCw },
  completed:   { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400',icon: CheckCircle2 },
  cancelled:   { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400',   icon: XCircle },
  rejected:    { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400',    icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.cancelled;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function CancelModal({
  booking,
  onConfirm,
  onClose,
  loading,
}: {
  booking: Booking;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cancel Session</h3>
            <p className="mt-1 text-sm text-gray-500">
              {booking.student?.name} → {booking.mentor?.name}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Cancellation Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Scheduling conflict, policy violation..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep Session
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || 'Cancelled by admin')}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Cancelling…' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminBookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBookings = useCallback(async (pg: number, st: StatusFilter, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: pg, limit: 15 };
      if (st !== 'all') params.status = st;
      if (q) params.search = q;

      const res = await apiClient.get<Booking[]>('/api/v1/admin/bookings', { params: params as Record<string, string | number | boolean> });
      if (!res.success) throw new Error(res.error ?? 'Failed to load bookings');

      setBookings(res.data ?? []);
      setTotal(res.total ?? 0);
      setPage(res.page ?? pg);
      setPages(res.pages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings(page, statusFilter, search);
  }, [page, statusFilter, search, loadBookings]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (s: StatusFilter) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await apiClient.put(`/api/v1/admin/bookings/${cancelTarget._id}/cancel`, { reason });
      if (res.success) {
        showToast('Session cancelled successfully.');
        setCancelTarget(null);
        await loadBookings(page, statusFilter, search);
      } else {
        showToast(res.error ?? 'Cancel failed', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="pb-16 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[300] rounded-xl px-5 py-3 text-sm font-bold shadow-xl border transition-all ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-8 sm:px-8 -mx-6 sm:-mx-8 -mt-6">
          <div className="max-w-5xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Portal</p>
              <h1 className="text-3xl font-extrabold text-black flex items-center gap-3">
                <CalendarDays className="text-black" size={28} />
                Sessions Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor, filter, and manage all platform sessions platform-wide.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700">
                {total} Total Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or mentor name…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
            {search && (
              <button
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-gray-400 mr-1" />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                  statusFilter === s
                    ? 'bg-black text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm font-medium text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
                <div className="w-12 h-12 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <CalendarDays size={28} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No sessions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? `No results for "${search}"` : `No ${statusFilter === 'all' ? '' : statusFilter} sessions yet.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Student', 'Mentor', 'Date & Time', 'Type', 'Price', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="group hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{b.student?.name ?? '—'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.student?.email ?? ''}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{b.mentor?.name ?? '—'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.mentor?.email ?? ''}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <div className="font-medium">{b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.startTime} – {b.endTime}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-bold text-gray-700 capitalize">
                          {b.sessionType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">
                        ₹{b.price ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4">
                        {b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'rejected' ? (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Ban size={12} />
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && bookings.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <p className="text-xs font-medium text-gray-500">
                Showing {bookings.length} of <span className="font-bold text-gray-900">{total}</span> sessions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="text-xs font-bold text-gray-900 px-2">
                  {page} / {pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={isCancelling}
        />
      )}
    </DashboardLayout>
  );
}

export default function AdminBookingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminBookingsContent />
    </ProtectedRoute>
  );
}
