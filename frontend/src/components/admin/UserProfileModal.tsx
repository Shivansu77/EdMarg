'use client';

import React, { useEffect, useState } from 'react';
import { X, Mail, Briefcase, GraduationCap, Star, Award, Clock, Phone } from 'lucide-react';
import { apiClient } from '@/utils/api-client';
import { getImageUrl } from '@/utils/imageUrl';
import Image from 'next/image';

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FullUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'student' | 'mentor' | 'admin';
  profileImage?: string;
  createdAt: string;
  studentProfile?: {
    classLevel?: string;
    interests?: string[];
  };
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    sessionDuration?: number;
    autoConfirm?: boolean;
    sessionNotes?: string;
    totalSessions?: number;
    rating?: number;
    approvalStatus?: string;
    rejectionReason?: string;
    linkedinUrl?: string;
  };
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [userData, setUserData] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserDetails = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await apiClient.get<FullUser>(`/api/v1/admin/users/${userId}`);
          if (res.success && res.data) {
            setUserData(res.data);
          } else {
            setError('Failed to load user details');
          }
        } catch (err) {
          console.error(err);
          setError('An error occurred while fetching details');
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-4xl border border-emerald-100/50 bg-white shadow-2xl transition-all">
        {/* Header/Banner */}
        <div className="relative h-32 bg-linear-to-r from-emerald-500 to-cyan-600">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-0 sm:px-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Profile...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <X size={24} />
              </div>
              <p className="font-bold text-slate-900">{error}</p>
              <button onClick={onClose} className="mt-4 text-sm font-bold text-emerald-600 underline">Close</button>
            </div>
          ) : userData ? (
            <div className="-mt-16">
              {/* Profile Header */}
              <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
                <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-slate-50 shadow-xl">
                  <Image 
                    src={getImageUrl(userData.profileImage, userData.name)} 
                    alt={userData.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="mt-4 text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{userData.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      userData.role === 'admin' ? 'bg-slate-900 text-white' : 
                      userData.role === 'mentor' ? 'bg-cyan-100 text-cyan-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {userData.role}
                    </span>
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} />
                      Joined {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats/Info Grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                    <p className="text-sm font-bold text-slate-900">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <Phone className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number</p>
                    <p className="text-sm font-bold text-slate-900">{userData.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
                {userData.role === 'mentor' && (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <Award className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Experience</p>
                      <p className="text-sm font-bold text-slate-900">{userData.mentorProfile?.experienceYears || 0} Years</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Specific Details */}
              <div className="mt-8 space-y-6">
                {userData.role === 'student' && userData.studentProfile && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Academic Background</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Education Level</p>
                        <p className="mt-1 font-bold text-slate-900">{userData.studentProfile.classLevel || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interests</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {userData.studentProfile.interests?.map(interest => (
                            <span key={interest} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              {interest}
                            </span>
                          )) || <p className="text-sm text-slate-500">None added</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {userData.role === 'mentor' && userData.mentorProfile && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-5 w-5 text-cyan-600" />
                      <h3 className="text-lg font-bold text-slate-900">Mentor Details</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bio</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{userData.mentorProfile.bio || 'No bio provided'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verified Rating</p>
                          <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-900">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {userData.mentorProfile.rating || '0.0'}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Sessions</p>
                          <p className="mt-1 font-bold text-slate-900">{userData.mentorProfile.totalSessions || 0}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Price Per Session</p>
                          <p className="mt-1 font-bold text-slate-900">{userData.mentorProfile.pricePerSession || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Session Duration</p>
                          <p className="mt-1 font-bold text-slate-900">{userData.mentorProfile.sessionDuration || 45} min</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Approval Status</p>
                        <p className="mt-1 font-bold text-slate-900">{userData.mentorProfile.approvalStatus || 'pending'}</p>
                        {userData.mentorProfile.rejectionReason && (
                          <p className="mt-1 text-sm text-red-600">Reason: {userData.mentorProfile.rejectionReason}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">LinkedIn</p>
                          {userData.mentorProfile.linkedinUrl ? (
                            <a
                              href={userData.mentorProfile.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex font-bold text-cyan-700 underline decoration-cyan-300 underline-offset-4"
                            >
                              linkedin
                            </a>
                          ) : (
                            <p className="mt-1 font-bold text-slate-900">Not provided</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Session Notes</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{userData.mentorProfile.sessionNotes || 'No notes provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Expertise</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {userData.mentorProfile.expertise?.map(exp => (
                            <span key={exp} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                              {exp}
                            </span>
                          )) || <p className="text-sm text-slate-500">Not specified</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
