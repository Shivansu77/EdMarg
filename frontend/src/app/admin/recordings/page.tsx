/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SessionRecordingPlayer from '@/components/SessionRecordingPlayer';
import { apiClient } from '@/utils/api-client';
import {
  Search,
  Video,
  Calendar,
  Filter,
  Download,
  Play,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  Users,
  Loader2,
} from 'lucide-react';

type RecordingStatus = 'pending' | 'downloading' | 'uploading' | 'completed' | 'failed';
type TypeFilter = 'all' | 'manual' | 'zoom';
type SortField = 'date' | 'duration' | 'fileSize' | 'status';

const NO_CACHE_HEADERS = {
  'x-bypass-cache': '1',
  'Cache-Control': 'no-cache',
} as const;

type SessionInfo = {
  _id: string;
  sessionType?: string;
  zoomMeetingId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

interface AdminRecording {
  _id: string;
  sessionId?: SessionInfo | string | null;
  studentId?: {
    _id: string;
    name: string;
    email: string;
  };
  mentorId?: {
    _id: string;
    name: string;
    email: string;
  };
  meetingId?: string;
  duration: number;
  fileSize: number;
  recordingType: string;
  processingStatus: RecordingStatus;
  createdAt: string;
  videoUrl?: string;
}

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  const value = new Date(dateString);
  if (Number.isNaN(value.getTime())) return '—';
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimeRange = (session?: SessionInfo | string | null) => {
  if (!session || typeof session === 'string') return '';
  if (session.startTime && session.endTime) {
    return `${session.startTime} - ${session.endTime}`;
  }
  return '';
};

const formatSessionType = (session?: SessionInfo | string | null) => {
  if (!session || typeof session === 'string' || !session.sessionType) {
    return 'Mentorship Session';
  }

  const value = session.sessionType.replace(/-/g, ' ');
  return `${value.charAt(0).toUpperCase()}${value.slice(1)} Session`;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function statusPill(status: RecordingStatus) {
  if (status === 'completed') {
    return {
      label: 'Ready',
      className:
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700',
      icon: <CheckCircle size={12} />,
    };
  }

  if (status === 'failed') {
    return {
      label: 'Failed',
      className:
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700',
      icon: <AlertCircle size={12} />,
    };
  }

  if (status === 'uploading' || status === 'downloading') {
    return {
      label: status === 'uploading' ? 'Uploading' : 'Downloading',
      className:
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700',
      icon: <Loader2 size={12} className="animate-spin" />,
    };
  }

  return {
    label: 'Pending',
    className:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700',
    icon: <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />,
  };
}

function AdminRecordingsContent() {
  const [data, setData] = useState<AdminRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [selectedRecording, setSelectedRecording] = useState<AdminRecording | null>(null);

  const loadRecordings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<AdminRecording[]>('/api/v1/admin/recordings', {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch,
          type: typeFilter,
          status: statusFilter,
          sortField,
          sortAsc,
        },
        headers: NO_CACHE_HEADERS,
      });

      if (!res.success) {
        throw new Error(res.error || res.message || 'Failed to load recordings');
      }

      setData(res.data ?? []);
      setTotalPages(res.pages || 1);
      setTotalItems(res.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
      setData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, sortAsc, sortField, statusFilter, typeFilter]);

  useEffect(() => {
    void loadRecordings();
  }, [loadRecordings]);

  const readyCountOnPage = useMemo(
    () => data.filter((item) => item.processingStatus === 'completed').length,
    [data]
  );
  const failedCountOnPage = useMemo(
    () => data.filter((item) => item.processingStatus === 'failed').length,
    [data]
  );
  const processingCountOnPage = useMemo(
    () => data.filter((item) => ['pending', 'uploading', 'downloading'].includes(item.processingStatus)).length,
    [data]
  );

  const toggleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortAsc((current) => !current);
      return;
    }

    setSortField(field);
    setSortAsc(false);
  };

  const handleDownload = (e: React.MouseEvent, recording: AdminRecording) => {
    e.stopPropagation();
    if (recording.videoUrl) {
      window.open(recording.videoUrl, '_blank');
      return;
    }

    window.alert('Download URL is not available yet for this recording.');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;

    const startPage = Math.max(1, Math.min(page - Math.floor(maxVisible / 2), totalPages - maxVisible + 1));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="w-10 h-10 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-slate-400">
            <MoreHorizontal size={16} />
          </span>
        );
      }
    }

    Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, offset) => startPage + offset).forEach((pageNumber) => {
      pages.push(
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
            page === pageNumber
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {pageNumber}
        </button>
      );
    });

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-slate-400">
            <MoreHorizontal size={16} />
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="w-10 h-10 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    );

    return pages;
  };

  const selectedSessionId =
    selectedRecording && typeof selectedRecording.sessionId === 'string'
      ? selectedRecording.sessionId
      : selectedRecording && selectedRecording.sessionId
      ? selectedRecording.sessionId._id
      : '';

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-6 pb-16 bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200 px-6 py-8 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-4">
                <Video size={14} /> Recording Vault
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Recordings</h1>
              <p className="mt-2 text-slate-500 font-medium">
                Monitor uploads, review recordings, and quickly spot failures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">Total Videos</p>
                <p className="text-2xl font-black text-slate-900">{totalItems}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-emerald-700 mb-1">Ready on Page</p>
                <p className="text-2xl font-black text-emerald-800">{readyCountOnPage}</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-rose-700 mb-1">Need Attention</p>
                <p className="text-2xl font-black text-rose-800">{failedCountOnPage + processingCountOnPage}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-8">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="text-rose-600" size={20} />
              <p className="text-sm font-bold text-rose-800">{error}</p>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by participant, meeting id, or recording type"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value as TypeFilter);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  <option value="manual">Manual Upload</option>
                  <option value="zoom">Zoom Capture</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="downloading">Downloading</option>
                  <option value="uploading">Uploading</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-[30%] px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Recording
                    </th>
                    <th className="w-[24%] px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Participants
                    </th>
                    <th
                      className="w-[16%] px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Date {sortField === 'date' && (sortAsc ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="w-[14%] px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('duration')}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Duration {sortField === 'duration' && (sortAsc ? '↑' : '↓')}
                      </div>
                    </th>
                    <th
                      className="w-[14%] px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
                      </div>
                    </th>
                    <th className="w-[10%] px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleSort('fileSize')}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700"
                      >
                        Size {sortField === 'fileSize' && (sortAsc ? '↑' : '↓')}
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading && data.length === 0 ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`} className="animate-pulse bg-white">
                        <td className="px-6 py-5">
                          <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2" />
                          <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-4 bg-slate-200 rounded-md w-24 mb-2" />
                          <div className="h-3 bg-slate-100 rounded-md w-20" />
                        </td>
                        <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded-md w-24" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded-md w-20" /></td>
                        <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
                        <td className="px-6 py-5 text-right"><div className="h-4 bg-slate-200 rounded-md w-12 ml-auto" /></td>
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 ring-8 ring-slate-50/50">
                          <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">No recordings found</h3>
                        <p className="text-slate-500 mt-1">
                          Adjust your search or filters to find what you&apos;re looking for.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data.map((rec) => {
                      const statusMeta = statusPill(rec.processingStatus);
                      const session = typeof rec.sessionId === 'string' ? null : rec.sessionId;
                      const sessionTime = formatTimeRange(session);

                      return (
                        <tr key={rec._id} className="bg-white hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
                              {formatSessionType(rec.sessionId)}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase text-slate-600 border border-slate-200">
                                {rec._id.slice(-6)}
                              </span>
                              {rec.meetingId ? <span>Meeting: {rec.meetingId}</span> : null}
                              {session?.zoomMeetingId ? <span>Zoom: {session.zoomMeetingId}</span> : null}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {rec.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                              with {rec.mentorId?.name || 'Unknown Mentor'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                              <Calendar size={14} className="text-slate-400" />
                              {formatDate(session?.date || rec.createdAt)}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1">{sessionTime || 'Time unavailable'}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                              <Clock size={14} className="text-slate-400" />
                              {Math.max(0, Math.round((rec.duration || 0) / 60))} mins
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={statusMeta.className}>
                              {statusMeta.icon} {statusMeta.label}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(event) => handleDownload(event, rec)}
                                disabled={!rec.videoUrl}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Download size={12} />
                              </button>
                              <button
                                onClick={() => setSelectedRecording(rec)}
                                disabled={rec.processingStatus !== 'completed'}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Play size={12} /> Play
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">{formatBytes(rec.fileSize)}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-bold text-slate-900">{Math.min(page * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
                  <span className="font-bold text-slate-900">{totalItems}</span> results
                </p>
                <div className="flex items-center gap-1">{renderPagination()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/50">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{formatSessionType(selectedRecording.sessionId)}</h2>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                    {formatDate(selectedRecording.createdAt)} • {Math.round(selectedRecording.duration / 60) || 0} mins • {formatBytes(selectedRecording.fileSize)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecording(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
              <div className="bg-black w-full aspect-video flex items-center justify-center">
                {selectedSessionId ? (
                  <SessionRecordingPlayer sessionId={selectedSessionId} inline />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <AlertCircle size={48} className="mb-4 opacity-50" />
                    <p className="font-bold">Session ID missing for this recording.</p>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start bg-white border-t border-slate-200">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Participants</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center ring-4 ring-emerald-50">
                        {selectedRecording.studentId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500">Student</p>
                        <p className="text-sm font-bold text-slate-900">{selectedRecording.studentId?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center ring-4 ring-blue-50">
                        {selectedRecording.mentorId?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500">Mentor</p>
                        <p className="text-sm font-bold text-slate-900">{selectedRecording.mentorId?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={(event) => handleDownload(event, selectedRecording)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold transition-all shadow-md active:scale-95 w-full"
                  >
                    <Download size={16} /> Download Original File
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all shadow-sm active:scale-95 w-full"
                    onClick={() => {
                      window.alert('This can be connected to detailed session logs in the next iteration.');
                    }}
                  >
                    <Users size={16} /> View Session Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function AdminRecordingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminRecordingsContent />
    </ProtectedRoute>
  );
}
