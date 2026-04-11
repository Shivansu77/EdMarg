/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { Users, UserCheck, Trash2, Shield, Eye, GraduationCap, Briefcase, Calendar } from 'lucide-react';
import UserProfileModal from '@/components/admin/UserProfileModal';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  createdAt: string;
};

function AdminUsersContent() {
  const [activeTab, setActiveTab] = useState<'students' | 'mentors'>('students');
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const role = activeTab === 'students' ? 'student' : 'mentor';
      const res = await apiClient.get<{ users: User[] }>('/api/v1/admin/users', { params: { role } });
      if (res.success && res.data) {
        const usersList = Array.isArray(res.data) ? res.data : (res.data as any).users || [];
        if (activeTab === 'students') {
          setStudents(usersList);
        } else {
          setMentors(usersList);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await apiClient.delete(`/api/admin/users/${id}`);
      if (res.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleOpenProfile = (id: string) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const users = activeTab === 'students' ? students : mentors;

  return (
    <DashboardLayout userName="Admin Operations">
      <div className="space-y-8 pb-12">
        {/* ======== Header Section ======== */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100/50 bg-linear-to-br from-white via-slate-50 to-emerald-50/50 p-8 shadow-sm sm:p-10">
          <div className="relative z-10 flex flex-col gap-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
              <Shield size={12} />
              User Governance
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              User Management
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-600">
              Oversee all platform participants, inspect detailed profiles, and maintain platform integrity.
            </p>
          </div>
          
          {/* Subtle Background Accent */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
        </section>

        {/* ======== Tabs ======== */}
        <div className="flex flex-wrap gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`group flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === 'students'
                ? 'border-b-2 border-emerald-500 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <GraduationCap size={18} className={activeTab === 'students' ? 'text-emerald-500' : 'text-slate-300'} />
            Students
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`group flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === 'mentors'
                ? 'border-b-2 border-cyan-500 text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={18} className={activeTab === 'mentors' ? 'text-cyan-500' : 'text-slate-300'} />
            Mentors
          </button>
        </div>

        {/* ======== Users Table ======== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              {activeTab} Registry
              <span className="ml-3 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                {users.length} Total
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                {activeTab === 'students' ? <GraduationCap size={32} /> : <Briefcase size={32} />}
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">No {activeTab} recorded</h3>
              <p className="mt-1 text-slate-500">The registry is currently empty for this role.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl font-bold flex items-center justify-center ${activeTab === 'students' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{user.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenProfile(user._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:border-emerald-200 hover:text-emerald-700 active:scale-95 shadow-xs"
                          >
                            <Eye size={14} />
                            View Profile
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center justify-center p-2 text-slate-300 transition-all hover:text-red-500 hover:bg-red-50 rounded-lg active:scale-90"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Profile Inspection Modal */}
      {selectedUserId && (
        <UserProfileModal 
          userId={selectedUserId} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
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
