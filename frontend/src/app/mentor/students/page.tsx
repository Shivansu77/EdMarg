'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Users, Mail, Calendar } from 'lucide-react';
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

  if (loading) {
    return (
      <DashboardLayout userName="Students">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user?.name || "Students"}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-8 h-8 text-indigo-600" />
              My Students
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              A directory of all students who have interacted with you on the platform.
            </p>
          </div>
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {filteredStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No students matched your search criteria." : "You haven't had any sessions with students yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                      {student.profileImage ? (
                        <Image src={getImageUrl(student.profileImage, student.name)} alt={student.name} width={56} height={56} className="object-cover object-top" />
                      ) : (
                        <span className="text-xl font-bold text-indigo-600">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[180px]">{student.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-5 border-t border-b border-gray-50 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Sessions</span>
                      <strong className="text-xl text-gray-900 mt-1">{student.totalSessions}</strong>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming</span>
                      <strong className="text-xl text-indigo-600 mt-1">{student.upcomingSessions}</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Last Session:</span>
                    </div>
                    <span className="font-medium text-gray-700">{formatDate(student.lastSessionDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
