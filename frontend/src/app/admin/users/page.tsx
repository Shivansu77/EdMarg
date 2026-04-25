/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  Users, Eye, Trash2, GraduationCap, Briefcase,
  Calendar, Search, X, ChevronLeft, ChevronRight, ShieldCheck, AlertCircle,
} from 'lucide-react';
import UserProfileModal from '@/components/admin/UserProfileModal';

type Role = 'student' | 'mentor';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  createdAt: string;
  mentorProfile?: {
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    expertise?: string[];
    totalSessions?: number;
  };
  studentProfile?: {
    classLevel?: string;
    interests?: string[];
  };
};

const ROLE_TAB_CONFIG: { key: Role; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'student', label: 'Students', icon: GraduationCap, color: 'text-emerald-600' },
  { key: 'mentor',  label: 'Mentors',  icon: Briefcase,     color: 'text-cyan-600'    },
];

const MENTOR_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pending:  { bg: 'bg-amber-50',   text: 'text-amber-700'  },
  rejected: { bg: 'bg-red-50',     text: 'text-red-700'    },
};

function AdminUsersContent() {
  const [activeTab, setActiveTab] = useState<Role>('student');
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadUsers = useCallback(async (pg: number, role: Role, q: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { role, page: pg, limit: 20 };
      if (q) params.search = q;
      const res = await apiClient.get<User[]>('/api/v1/admin/users', { params });
      if (res.success) {
        const list: User[] = Array.isArray(res.data) ? res.data : (res.data as any)?.users ?? [];
        setUsers(list);
        setTotal(res.total ?? list.length);
        setPage(res.page ?? pg);
        setPages(res.pages ?? 1);
      }
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers(page, activeTab, search);
  }, [page, activeTab, search, loadUsers]);

  const switchTab = (tab: Role) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setSearchInput('');
    searchRef.current?.focus();
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await apiClient.delete(`/api/v1/admin/users/${id}`);
      if (res.success) {
        showToast(`${name} has been deleted.`);
        await loadUsers(page, activeTab, search);
      } else {
        showToast(res.error ?? 'Delete failed', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openProfile = (id: string) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout userName="Admin Operations">
      <div className="pb-14 space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[300] rounded-xl px-5 py-3 text-sm font-bold shadow-xl border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-8 sm:px-8 -mx-6 sm:-mx-8 -mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-5xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin Portal</p>
              <h1 className="text-3xl font-extrabold text-black flex items-center gap-3">
                <Users className="text-black" size={28} />
                User Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Inspect, search, and manage all platform participants.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700">
                {total} {activeTab === 'student' ? 'Students' : 'Mentors'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs + Search Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
            {ROLE_TAB_CONFIG.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  activeTab === key
                    ? 'bg-white shadow text-gray-900 border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} className={activeTab === key ? color : 'text-gray-400'} />
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search ${activeTab === 'student' ? 'students' : 'mentors'}…`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={handleSearch}
              className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
            {search && (
              <button
                onClick={handleClearSearch}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
            <div className="flex items-center gap-3">
              {activeTab === 'student'
                ? <GraduationCap size={18} className="text-emerald-500" />
                : <Briefcase size={18} className="text-cyan-500" />
              }
              <h2 className="font-bold text-gray-900 text-base">
                {activeTab === 'student' ? 'Student' : 'Mentor'} Registry
              </h2>
            </div>
            {search && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                Results for &ldquo;{search}&rdquo;
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-gray-200 rounded-full" />
                <div className="w-10 h-10 border-4 border-black rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 mb-4">
                {activeTab === 'student' ? <GraduationCap size={28} className="text-gray-300" /> : <Briefcase size={28} className="text-gray-300" />}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {search ? `No results for "${search}"` : `No ${activeTab}s found`}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {search ? 'Try a different search term.' : 'The registry is empty for this role.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">User</th>
                    {activeTab === 'mentor' && (
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    )}
                    {activeTab === 'student' && (
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Level</th>
                    )}
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">Joined</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const mentorStatus = user.mentorProfile?.approvalStatus;
                    const mentorStyle = mentorStatus ? MENTOR_STATUS_STYLE[mentorStatus] : null;
                    const isDeleting = deletingId === user._id;

                    return (
                      <tr key={user._id} className={`group hover:bg-gray-50/50 transition-colors ${isDeleting ? 'opacity-40' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl font-extrabold flex items-center justify-center text-sm ${
                              activeTab === 'student' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {activeTab === 'mentor' && (
                          <td className="px-6 py-4">
                            {mentorStyle ? (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${mentorStyle.bg} ${mentorStyle.text}`}>
                                <ShieldCheck size={10} />
                                {mentorStatus}
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                        )}

                        {activeTab === 'student' && (
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.studentProfile?.classLevel ?? <span className="text-gray-300">—</span>}
                          </td>
                        )}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Calendar size={13} className="text-gray-300" />
                            {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openProfile(user._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() => void handleDelete(user._id, user.name)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90 disabled:opacity-40"
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <p className="text-xs font-medium text-gray-400">
                Showing {users.length} of <span className="font-bold text-gray-900">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="text-xs font-bold text-gray-900 px-2">{page} / {pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Profile Modal */}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setSelectedUserId(null); }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminUsers() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
