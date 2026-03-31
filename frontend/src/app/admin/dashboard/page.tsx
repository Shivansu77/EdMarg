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

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingMentors, setPendingMentors] = useState<Mentor[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData.data);
    };

    const fetchPending = async (page: number) => {
      const pendingRes = await fetch(`/api/admin/mentors/pending?page=${page}`);
      if (!pendingRes.ok) throw new Error('Failed to fetch pending mentors');
      const pendingData = await pendingRes.json();
      setPendingMentors(pendingData.data || []);
      setPendingPage(pendingData.page || page);
      setPendingPages(pendingData.pages || 1);
      setPendingTotal(pendingData.total || 0);
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchStats(), fetchPending(pendingPage)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPending = async (page: number) => {
      const pendingRes = await fetch(`/api/admin/mentors/pending?page=${page}`);
      if (!pendingRes.ok) throw new Error('Failed to fetch pending mentors');
      const pendingData = await pendingRes.json();
      setPendingMentors(pendingData.data || []);
      setPendingPages(pendingData.pages || 1);
      setPendingTotal(pendingData.total || 0);
    };

    void fetchPending(pendingPage).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending mentors');
    });
  }, [pendingPage]);

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
        // Reload both stats and current pending page to keep counts correct.
        setPendingPage(1);
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
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
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
      }
    } catch (err) {
      console.error('Error rejecting mentor:', err);
    }
  };

  return (
    <DashboardLayout userName="Admin Team">
      <div className="space-y-10 pb-10">
        <section className="rounded-[1.5rem] p-8 md:p-10 text-on-primary bg-[linear-gradient(135deg,#4e45e2_0%,#6e3bd8_100%)]">
          <p className="text-xs uppercase tracking-[0.2em] text-on-primary/80 font-semibold">Admin Mode</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-manrope font-extrabold tracking-[-0.02em]">Operational clarity at a glance.</h1>
          <p className="mt-4 max-w-3xl text-on-primary/85 text-base md:text-lg font-inter">
            Monitor mentor quality, student growth, and platform health through tonal layers built for high-density review.
          </p>
        </section>

        {error && (
          <div className="rounded-[1.5rem] p-6 bg-red-50 border border-red-200">
            <p className="text-red-700 font-semibold">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-[1.5rem] p-8 bg-surface-container-low text-center">
            <p className="text-on-surface-variant">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <section className="bg-surface-container-low rounded-[1.5rem] p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {adminStats.map((stat) => (
                  <article key={stat.label} className="rounded-[1.5rem] p-6 bg-surface-container-lowest space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-tertiary">
                      <stat.icon size={22} />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-on-surface-variant font-semibold">{stat.label}</p>
                    <h2 className="text-3xl font-manrope font-extrabold tracking-[-0.02em]">{stat.value}</h2>
                  </article>
                ))}
              </div>
            </section>

            {pendingMentors.length > 0 && (
              <section className="bg-surface-container-low rounded-[1.5rem] p-8">
                <h2 className="text-2xl font-bold mb-6">Pending Mentor Approvals</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Showing page <span className="font-bold">{pendingPage}</span> of <span className="font-bold">{pendingPages}</span> (total pending: <span className="font-bold">{pendingTotal}</span>)
                </p>
                <div className="space-y-4">
                  {pendingMentors.map((mentor) => (
                    <div key={mentor._id} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between bg-white">
                      <div>
                        <p className="font-semibold text-gray-900">{mentor.name}</p>
                        <p className="text-sm text-gray-600">{mentor.email}</p>
                        {mentor.mentorProfile?.expertise && (
                          <p className="text-xs text-gray-500 mt-1">{mentor.mentorProfile.expertise.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveMentor(mentor._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMentor(mentor._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                    disabled={pendingPage <= 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPendingPage((p) => Math.min(pendingPages, p + 1))}
                    disabled={pendingPage >= pendingPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </section>
            )}

            {pendingMentors.length === 0 && (
              <section className="bg-surface-container-low rounded-[1.5rem] p-8">
                <h2 className="text-2xl font-bold mb-2">Pending Mentor Approvals</h2>
                <p className="text-gray-600">
                  No pending mentors found at the moment.
                </p>
              </section>
            )}
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
