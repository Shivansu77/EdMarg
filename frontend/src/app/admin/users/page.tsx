'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import { Users, UserCheck, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const role = activeTab === 'students' ? 'student' : 'mentor';
      const res = await apiClient.get<{ users: User[] }>('/api/admin/users', { params: { role } });
      console.log('Users API response:', res);
      if (res.success && res.data) {
        const usersList = Array.isArray(res.data) ? res.data : res.data.users || [];
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
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await apiClient.delete(`/api/admin/users/${id}`);
      if (res.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const users = activeTab === 'students' ? students : mentors;

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
            User Management
          </h1>
          <p className="mt-2 text-gray-600">View and manage students and mentors</p>
        </section>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'students'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Students
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'mentors'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck className="inline mr-2" size={18} />
            Mentors
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {activeTab === 'students' ? 'Students' : 'Mentors'} ({users.length})
            </h2>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {activeTab === 'students' ? <Users size={48} className="mx-auto mb-4 opacity-50" /> : <UserCheck size={48} className="mx-auto mb-4 opacity-50" />}
              <p>No {activeTab} found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
