'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BriefcaseBusiness, GraduationCap, ShieldCheck, UserCog, CheckCircle, XCircle } from 'lucide-react';

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
    const [statsRes, pendingRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch(`/api/admin/mentors/pending?page=${page}`),
    ]);

    if (!statsRes.ok) throw new Error('Failed to fetch stats');
    if (!pendingRes.ok) throw new Error('Failed to fetch pending mentors');

    const statsData = await statsRes.json();
    const pendingData = await pendingRes.json();

    setStats(statsData.data);
    setPendingMentors(pendingData.data || []);
    setPendingPage(pendingData.page || page);
    setPendingPages(pendingData.pages || 1);
    setPendingTotal(pendingData.total || 0);
  };

  const loadAssessments = async (page: number) => {
    const assessmentsRes = await fetch(`/api/admin/assessments?page=${page}&limit=10`);
    if (!assessmentsRes.ok) throw new Error('Failed to fetch assessments');

    const assessmentsData = await assessmentsRes.json();
    setAssessments(assessmentsData.data || []);
    setAssessmentPage(assessmentsData.page || page);
    setAssessmentPages(assessmentsData.pages || 1);
    setAssessmentTotal(assessmentsData.total || 0);
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
    { label: 'Total Users', value: stats?.totalUsers || '0', icon: BriefcaseBusiness },
  ];

  const handleApproveMentor = async (mentorId: string) => {
    try {
      const res = await fetch(`/api/admin/mentors/${mentorId}/approve`, { method: 'PUT' });
      if (res.ok) {
        setPendingPage(1);
        await loadDashboard(1);
      }
    } catch (err) {
      console.error('Error approving mentor:', err);
    }
  };

  const handleRejectMentor = async (mentorId: string) => {
    try {
      const res = await fetch(`/api/admin/mentors/${mentorId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      });
      if (res.ok) {
        setPendingPage(1);
        await loadDashboard(1);
      }
    } catch (err) {
      console.error('Error rejecting mentor:', err);
    }
  };

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-500">
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
                Pending mentor approvals & platform stats
              </h1>
              <p className="mt-2 text-gray-600 font-inter max-w-3xl">
                Approve or reject mentors using live data from the backend. No hard-coded records.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-semibold text-sm sm:text-base">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <p className="text-gray-600 font-semibold text-sm sm:text-base">Loading dashboard...</p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {adminStats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-black text-white flex items-center justify-center">
                        <stat.icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.08em] font-semibold text-gray-500">
                          {stat.label}
                        </p>
                        <h2 className="text-2xl font-manrope font-extrabold tracking-tight text-gray-900">
                          {stat.value}
                        </h2>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Pending mentor approvals
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Page <span className="font-bold text-gray-900">{pendingPage}</span> of{' '}
                    <span className="font-bold text-gray-900">{pendingPages}</span> (total pending:{' '}
                    <span className="font-bold text-gray-900">{pendingTotal}</span>)
                  </p>
                </div>
              </div>

              {pendingMentors.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-gray-900 font-semibold">No pending mentors</p>
                  <p className="text-gray-600 text-sm mt-2">Check back later for new submissions.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                      <tr className="text-left">
                        <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                          Mentor
                        </th>
                        <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                          Expertise
                        </th>
                        <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingMentors.map((mentor) => (
                        <tr key={mentor._id} className="border-b border-gray-50">
                          <td className="py-4">
                            <div className="font-semibold text-gray-900">{mentor.name}</div>
                            <div className="text-sm text-gray-600">{mentor.email}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-sm text-gray-700">
                              {mentor.mentorProfile?.expertise?.length
                                ? mentor.mentorProfile.expertise.join(', ')
                                : '—'}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveMentor(mentor._id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectMentor(mentor._id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
                              >
                                <XCircle size={16} />
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

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                  disabled={pendingPage <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPendingPage((p) => Math.min(pendingPages, p + 1))}
                  disabled={pendingPage >= pendingPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Assessments
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Page <span className="font-bold text-gray-900">{assessmentPage}</span> of{' '}
                    <span className="font-bold text-gray-900">{assessmentPages}</span> (total:{' '}
                    <span className="font-bold text-gray-900">{assessmentTotal}</span>)
                  </p>
                </div>
              </div>

              {assessments.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center">
                  <p className="text-gray-900 font-semibold">No assessments found</p>
                  <p className="text-gray-600 text-sm mt-2">When students submit the assessment, it will appear here.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                      <thead>
                        <tr className="text-left">
                          <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                            Student
                          </th>
                          <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                            Completion
                          </th>
                          <th className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-3 border-b border-gray-100">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessments.map((submission) => {
                          const answers = submission.answers || {};
                          const keys = typeof answers === 'object' && answers ? Object.keys(answers) : [];
                          return (
                            <tr key={submission._id} className="border-b border-gray-50">
                              <td className="py-4">
                                <div className="font-semibold text-gray-900">
                                  {submission.student?.name || '—'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {submission.student?.email || '—'}
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="text-sm text-gray-700">
                                  {keys.length} answer{keys.length === 1 ? '' : 's'}
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="text-sm text-gray-700">
                                  {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '—'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => setAssessmentPage((p) => Math.max(1, p - 1))}
                      disabled={assessmentPage <= 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setAssessmentPage((p) => Math.min(assessmentPages, p + 1))}
                      disabled={assessmentPage >= assessmentPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
