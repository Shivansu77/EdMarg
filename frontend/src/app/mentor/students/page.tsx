'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import { Users, Mail, Calendar, Search, ArrowUpRight, Clock } from 'lucide-react';
import Image from 'next/image';

import { getImageUrl } from '@/utils/imageUrl';

interface Student {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  totalSessions: number;
  lastSessionDate: string | null;
  upcomingSessions: number;
}

export default function MentorStudentsPage() {
  const { user } = useAuth();
  const [studentsArray, setStudentsArray] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        // Fetch up to 200 bookings to extract unique students
        const res = await apiClient.get<{ bookings: { student: { _id: string; name: string; email: string; profileImage?: string }; status: string; date: string }[] }>('/api/v1/mentor/bookings?limit=200');
        if (res.success && res.data?.bookings) {
          const bookings = res.data.bookings;
          
          // Process bookings to extract unique students
          const studentsMap = new Map<string, Student>();
          
          bookings.forEach((booking: { 
            student: { _id: string; name: string; email: string; profileImage?: string }; 
            status: string; 
            date: string 
          }) => {
            const studentId = booking.student._id;
            
            if (!studentsMap.has(studentId)) {
              studentsMap.set(studentId, {
                _id: studentId,
                name: booking.student.name,
                email: booking.student.email,
                profileImage: booking.student.profileImage,
                totalSessions: 0,
                lastSessionDate: null,
                upcomingSessions: 0,
              });
            }
            
            const studentRecord = studentsMap.get(studentId)!;
            
            // Increment total sessions for completed/in-progress
            if (booking.status === 'completed') {
              studentRecord.totalSessions += 1;
              
              // Track latest completed session
              if (!studentRecord.lastSessionDate || new Date(booking.date) > new Date(studentRecord.lastSessionDate)) {
                studentRecord.lastSessionDate = booking.date;
              }
            }
            
            // Track upcoming sessions (confirmed)
            if (booking.status === 'confirmed' || booking.status === 'in-progress') {
              studentRecord.upcomingSessions += 1;
            }
            
          });
          
          setStudentsArray(Array.from(studentsMap.values()));
        } else {
          setError(res.message || 'Failed to load student data');
        }
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading students.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'mentor') {
      fetchStudentsData();
    }
  }, [user]);

  const filteredStudents = studentsArray.filter((s) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const totalStudents = studentsArray.length;
  const activeStudents = studentsArray.filter((s) => s.upcomingSessions > 0).length;

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading students...</p>
          </div>
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="min-h-screen pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1">
            Mentor Workspace
          </p>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/20">
                  <Users className="h-5 w-5 text-white" />
                </span>
                My Students
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                A directory of all students who have interacted with you on the platform.
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-72 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-center gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Students</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{totalStudents}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-center gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Now</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{activeStudents}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Sessions</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-900">
                {studentsArray.reduce((sum, s) => sum + s.totalSessions, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 text-red-500">!</div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mb-4 border border-emerald-100">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No students found</h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
              {searchTerm
                ? 'No students matched your search criteria.'
                : "You haven't had any sessions with students yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(16,185,129,0.07)] hover:border-emerald-200/60"
              >
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6">
                  {/* Student Info */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                      {student.profileImage ? (
                        <Image
                          src={getImageUrl(student.profileImage, student.name)}
                          alt={student.name}
                          width={56}
                          height={56}
                          className="object-cover object-top"
                        />
                      ) : (
                        <span className="text-xl font-bold text-emerald-700">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-5 border-t border-b border-slate-100 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Completed
                      </span>
                      <strong className="text-xl font-extrabold text-slate-900 mt-1">
                        {student.totalSessions}
                      </strong>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Upcoming
                      </span>
                      <strong className="text-xl font-extrabold mt-1">
                        {student.upcomingSessions > 0 ? (
                          <span className="text-emerald-600">{student.upcomingSessions}</span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </strong>
                    </div>
                  </div>
                  
                  {/* Last Session */}
                  <div className="flex items-center text-sm text-slate-500 justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Last Session:</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {formatDate(student.lastSessionDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorDashboardLayout>
  );
}
