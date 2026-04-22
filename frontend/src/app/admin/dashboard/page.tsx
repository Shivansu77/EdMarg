/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { Briefcase, GraduationCap, ShieldCheck, UserCog, CheckCircle, XCircle, Clipboard, Download, CheckSquare, CalendarDays, BookOpen, Users } from 'lucide-react';

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

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [pendingMentors, setPendingMentors] = useState<Mentor[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [assessments, setAssessments] = useState<AssessmentSubmission[]>([]);
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [assessmentPages, setAssessmentPages] = useState(1);
  const [assessmentTotal, setAssessmentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bulk action states
  const [selectedMentors, setSelectedMentors] = useState<Set<string>>(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const loadDashboard = async (page: number) => {
    const statsRes = await apiClient.get<DashboardStats>('/api/v1/admin/stats');
    const pendingRes = await apiClient.get<Mentor[]>(`/api/v1/admin/mentors/pending?page=${page}`);
    const bookingStatsRes = await apiClient.get<BookingStats>('/api/v1/admin/bookings/stats');

    if (!statsRes.success) throw new Error('Failed to fetch stats');
    if (!pendingRes.success) throw new Error('Failed to fetch pending mentors');

    setStats(statsRes.data || null);
    setBookingStats(bookingStatsRes.success ? (bookingStatsRes.data ?? null) : null);
    setPendingMentors(pendingRes.data || []);
    setPendingPage(pendingRes.page || page);
    setPendingPages(pendingRes.pages || 1);
    setPendingTotal(pendingRes.total || 0);
    setSelectedMentors(new Set()); // Reset selections on page change
  };

  const loadAssessments = async (page: number) => {
    const assessmentsRes = await apiClient.get<AssessmentSubmission[]>(`/api/v1/admin/assessments?page=${page}&limit=10`);
    if (!assessmentsRes.success) throw new Error('Failed to fetch assessments');

    setAssessments(assessmentsRes.data || []);
    setAssessmentPage(assessmentsRes.page || page);
    setAssessmentPages(assessmentsRes.pages || 1);
    setAssessmentTotal(assessmentsRes.total || 0);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([loadDashboard(pendingPage), loadAssessments(assessmentPage)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPage]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadAssessments(assessmentPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assessments');
      } finally {
        setLoading(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentPage]);

  const adminStats = [
    { label: 'Students Active', value: stats?.totalStudents || '0', icon: GraduationCap, href: '/admin/users' },
    { label: 'Mentors Verified', value: stats?.approvedMentors || '0', icon: ShieldCheck, href: '/admin/users?tab=mentor' },
    { label: 'Pending Approval', value: stats?.pendingMentors || '0', icon: UserCog, href: '/admin/users?tab=mentor' },
    { label: 'Total Users', value: stats?.totalUsers || '0', icon: Users, href: '/admin/users' },
    {
      label: 'Total Sessions',
      value: bookingStats
        ? Object.values(bookingStats).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0
        : '—',
      icon: CalendarDays,
      href: '/admin/bookings',
    },
  ];

  const handleApproveMentor = async (mentorId: string) => {
    try {
      const res = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/approve`, {});
      if (res.success) {
        setPendingPage(1);
        await loadDashboard(1);
      }
    } catch (err) {
      console.error('Error approving mentor:', err);
    }
  };

  const handleRejectMentor = async (mentorId: string, mentorName: string) => {
    const shouldReject = window.confirm(
      `Are you sure you want to reject ${mentorName}'s mentor request?`
    );

    if (!shouldReject) {
      return;
    }

    try {
      const res = await apiClient.put(`/api/v1/admin/mentors/${mentorId}/reject`, { reason: 'Rejected by admin' });
      if (res.success) {
        setPendingPage(1);
        await loadDashboard(1);
      }
    } catch (err) {
      console.error('Error rejecting mentor:', err);
    }
  };

  const toggleAllMentors = () => {
    if (selectedMentors.size === pendingMentors.length && pendingMentors.length > 0) {
      setSelectedMentors(new Set());
    } else {
      setSelectedMentors(new Set(pendingMentors.map((m) => m._id)));
    }
  };

  const toggleMentor = (id: string) => {
    const newSet = new Set(selectedMentors);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMentors(newSet);
  };

  const handleBulkApprove = async () => {
    if (!selectedMentors.size) return;

    setIsProcessingBulk(true);
    try {
      await Promise.all(
        Array.from(selectedMentors).map((id) =>
          apiClient.put(`/api/v1/admin/mentors/${id}/approve`, {})
        )
      );
      setSelectedMentors(new Set());
      setPendingPage(1);
      await loadDashboard(1);
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

    if (!shouldReject) {
      return;
    }

    setIsProcessingBulk(true);
    try {
      await Promise.all(
        Array.from(selectedMentors).map((id) =>
          apiClient.put(`/api/v1/admin/mentors/${id}/reject`, { reason: 'Bulk rejected by admin' })
        )
      );
      setSelectedMentors(new Set());
      setPendingPage(1);
      await loadDashboard(1);
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

    assessments.forEach((sub) => {
      const answers = sub.answers || {};
      const keys = typeof answers === 'object' && answers ? Object.keys(answers) : [];
      const name = `"${(sub.student?.name || 'Unknown').replace(/"/g, '""')}"`;
      const email = `"${(sub.student?.email || '').replace(/"/g, '""')}"`;
      const date = sub.createdAt ? `"${new Date(sub.createdAt).toLocaleDateString()}"` : '""';
      csvRows.push([name, email, keys.length, date].join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edmarg_assessments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-8 pb-16 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
        {/* ======== Header Section ======== */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-8 sm:px-8">
          <div className="max-w-4xl flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Admin Control Center
              </p>
              <h1 className="text-4xl font-bold text-black">
                Platform Overview
              </h1>
              <p className="mt-2 text-gray-600">
                Manage mentor approvals, track assessments, and monitor platform-wide growth metrics.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
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
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 max-w-375 mx-auto space-y-8">
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
                 <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                 <div className="w-12 h-12 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest">Loading data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {adminStats.map((stat) => (
                <Link key={stat.label} href={stat.href}>
                  <div
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-black hover:shadow-xl flex flex-col cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-black shadow-sm transition-transform group-hover:scale-110 border border-gray-200">
                        <stat.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          {stat.label}
                        </p>
                        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-black">
                          {stat.value}
                        </h2>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
                  <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">No new mentor registrations require approval.</p>
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
                              {mentor.mentorProfile?.expertise?.slice(0, 3).map((exp) => (
                                <span key={exp} className="rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold text-gray-700">
                                  {exp}
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

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50/50 p-4">
                <button
                  onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                  disabled={pendingPage <= 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-gray-900 mx-2">
                  Page {pendingPage} of {pendingPages}
                </span>
                <button
                  onClick={() => setPendingPage((p) => Math.min(pendingPages, p + 1))}
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
                  <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">Submissions will appear here as students complete them.</p>
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
                                  <div className="font-bold text-gray-900">
                                    {submission.student?.name || 'Unknown Student'}
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                                    {submission.student?.email || '—'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs font-bold text-black">
                                  {keys.length} Data Points
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-gray-50/50 p-4">
                    <button
                      onClick={() => setAssessmentPage((p) => Math.max(1, p - 1))}
                      disabled={assessmentPage <= 1}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-bold text-gray-900 mx-2">
                      Page {assessmentPage} of {assessmentPages}
                    </span>
                    <button
                      onClick={() => setAssessmentPage((p) => Math.min(assessmentPages, p + 1))}
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
