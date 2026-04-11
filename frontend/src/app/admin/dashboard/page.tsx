/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { Briefcase, GraduationCap, ShieldCheck, UserCog, CheckCircle, XCircle, Clipboard } from 'lucide-react';

type DashboardStats = {
  totalStudents: number;
  approvedMentors: number;
  pendingMentors: number;
  totalUsers: number;
};

type Mentor = {
  _id: string;
  name: string;
  email: string;
  mentorProfile?: {
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    expertise?: string[];
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

  const loadDashboard = async (page: number) => {
    const statsRes = await apiClient.get<DashboardStats>('/api/v1/admin/stats');
    const pendingRes = await apiClient.get<Mentor[]>(`/api/v1/admin/mentors/pending?page=${page}`);

    if (!statsRes.success) throw new Error('Failed to fetch stats');
    if (!pendingRes.success) throw new Error('Failed to fetch pending mentors');

    setStats(statsRes.data || null);
    setPendingMentors(pendingRes.data || []);
    setPendingPage(pendingRes.page || page);
    setPendingPages(pendingRes.pages || 1);
    setPendingTotal(pendingRes.total || 0);
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
    { label: 'Students Active', value: stats?.totalStudents || '0', icon: GraduationCap },
    { label: 'Mentors Verified', value: stats?.approvedMentors || '0', icon: ShieldCheck },
    { label: 'Pending Approval', value: stats?.pendingMentors || '0', icon: UserCog },
    { label: 'Total Users', value: stats?.totalUsers || '0', icon: Briefcase },
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

  const handleRejectMentor = async (mentorId: string) => {
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

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-8 pb-12">
        {/* ======== Header Section ======== */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100/50 bg-linear-to-br from-white via-slate-50 to-emerald-50/50 p-8 shadow-sm sm:p-10">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
                Admin Control Center
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Platform Overview
              </h1>
              <p className="mt-3 max-w-2xl text-lg font-medium text-slate-600">
                Manage mentor approvals, track assessments, and monitor platform-wide growth metrics.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/users">
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-95">
                  <UserCog size={18} />
                  Manage Users
                </button>
              </Link>
            </div>
          </div>
          
          {/* Subtle Background Accent */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
          <div className="absolute -bottom-20 left-20 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <XCircle className="text-red-500" size={20} />
            <p className="text-red-700 font-bold text-sm">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 text-slate-900 shadow-md transition-transform group-hover:scale-110">
                      <stat.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {stat.label}
                      </p>
                      <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                        {stat.value}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <h2 className="text-xl font-bold text-slate-900">Pending Mentor Approvals</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  <span className="text-slate-900 font-bold">{pendingTotal}</span> applications awaiting review
                </p>
              </div>

              {pendingMentors.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <UserCog size={32} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">All caught up!</h3>
                  <p className="mt-1 text-slate-500">No new mentor registrations require approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-left">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Mentor Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Expertise</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingMentors.map((mentor) => (
                        <tr key={mentor._id} className="group transition-colors hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                                {mentor.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{mentor.name}</div>
                                <div className="text-xs text-slate-500 font-medium">{mentor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {mentor.mentorProfile?.expertise?.slice(0, 3).map((exp) => (
                                <span key={exp} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                                  {exp}
                                </span>
                              )) || <span className="text-slate-400">—</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveMentor(mentor._id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
                              >
                                <CheckCircle size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectMentor(mentor._id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
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
              <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-4">
                <button
                  onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                  disabled={pendingPage <= 1}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-900 mx-2">
                  Page {pendingPage} / {pendingPages}
                </span>
                <button
                  onClick={() => setPendingPage((p) => Math.min(pendingPages, p + 1))}
                  disabled={pendingPage >= pendingPages}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">Recent Assessments</h2>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  <span className="text-slate-900 font-bold">{assessmentTotal}</span> total submissions tracked
                </p>
              </div>

              {assessments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <Clipboard size={32} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">No submissions yet</h3>
                  <p className="mt-1 text-slate-500">Submissions will appear here as students complete them.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-left">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Student</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Responses</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assessments.map((submission) => {
                          const answers = submission.answers || {};
                          const keys = typeof answers === 'object' && answers ? Object.keys(answers) : [];
                          return (
                            <tr key={submission._id} className="group transition-colors hover:bg-slate-50/50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {submission.student?.name || 'Unknown Student'}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">
                                    {submission.student?.email || '—'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                  {keys.length} Data Points
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-600">
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
                  <div className="flex items-center justify-center gap-2 border-t border-slate-100 p-4">
                    <button
                      onClick={() => setAssessmentPage((p) => Math.max(1, p - 1))}
                      disabled={assessmentPage <= 1}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-bold text-slate-900 mx-2">
                      Page {assessmentPage} / {assessmentPages}
                    </span>
                    <button
                      onClick={() => setAssessmentPage((p) => Math.min(assessmentPages, p + 1))}
                      disabled={assessmentPage >= assessmentPages}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40"
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
