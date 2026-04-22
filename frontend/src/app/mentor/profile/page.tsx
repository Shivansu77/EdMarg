/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
'use client';

import React, { useState, useEffect } from 'react';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import Image from 'next/image';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { 
  UserCircle, 
  Mail, 
  Briefcase, 
  Sparkles, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Settings,
  MessageSquare
} from 'lucide-react';

// Predefined set of common technical/career interests/expertise
const PREDEFINED_EXPERTISE = [
  'Software Engineering', 'Data Science', 'Machine Learning', 
  'Product Management', 'Design', 'Marketing', 'Finance', 
  'Consulting', 'Entrepreneurship', 'Web Development', 
  'Mobile Development', 'Cybersecurity', 'Cloud Computing',
  'DevOps', 'System Design', 'Interview Prep', 'Career Guidance'
];

interface MentorProfile {
  name: string;
  profileImage: string;
  mentorProfile?: {
    bio?: string;
    experienceYears?: number;
    expertise?: string[];
    pricePerSession?: number;
    sessionDuration?: number;
    autoConfirm?: boolean;
    sessionNotes?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
}

function MentorProfileContent() {
  const { user, updateUser } = useAuth();
  
  // Form State - Personal
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  // Form State - Professional
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [expertise, setExpertise] = useState<string[]>([]);
  
  // Form State - Session Settings
  const [pricePerSession, setPricePerSession] = useState<number | ''>('');
  const [sessionDuration, setSessionDuration] = useState<number>(45);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch complete user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<MentorProfile>('/api/v1/users/me');
        if (res.success && res.data) {
          const userData = res.data;
          
          setName(userData.name || '');
          setProfileImage(userData.profileImage || '');
          
          const mProfile = userData.mentorProfile || {};
          setBio(mProfile.bio || '');
          setExperienceYears(mProfile.experienceYears || '');
          setExpertise(mProfile.expertise || []);
          
          setPricePerSession(mProfile.pricePerSession ?? '');
          setSessionDuration(mProfile.sessionDuration || 45);
          setAutoConfirm(mProfile.autoConfirm ?? false);
          setSessionNotes(mProfile.sessionNotes || '');
          setApprovalStatus(mProfile.approvalStatus || 'pending');
          setRejectionReason(mProfile.rejectionReason || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleExpertiseToggle = (skill: string) => {
    setExpertise(prev => 
      prev.includes(skill) 
        ? prev.filter(i => i !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name,
        profileImage,
        bio,
        experienceYears: experienceYears === '' ? 0 : Number(experienceYears),
        expertise,
        pricePerSession: pricePerSession === '' ? 0 : Number(pricePerSession),
        sessionDuration: Number(sessionDuration),
        autoConfirm,
        sessionNotes
      };

      const res = await apiClient.put('/api/v1/users/profile', payload);
      
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        updateUser({ name, profileImage, profileImageUpdatedAt: Date.now() });
        
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="max-w-4xl pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mentor Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your professional details, session rates, and booking preferences.
          </p>
        </div>

        {approvalStatus !== 'approved' && (
          <div className={`mb-8 rounded-xl p-4 border flex items-start gap-3 ${
            approvalStatus === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <Clock className={`w-5 h-5 mt-0.5 ${approvalStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${approvalStatus === 'rejected' ? 'text-red-900' : 'text-amber-900'}`}>
                {approvalStatus === 'rejected'
                  ? 'Your mentor account is currently rejected.'
                  : 'Your mentor profile is under admin review.'}
              </p>
              <p className={`text-sm mt-1 ${approvalStatus === 'rejected' ? 'text-red-800' : 'text-amber-800'}`}>
                You can update this profile now. Full mentor dashboard access will unlock after approval.
              </p>
              {approvalStatus === 'rejected' && rejectionReason && (
                <p className="text-sm mt-2 text-red-800"><span className="font-semibold">Reason:</span> {rejectionReason}</p>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm font-medium text-red-900">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 rounded-xl bg-green-50 p-4 border border-green-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm font-medium text-green-900">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-gray-900">Profile Picture</label>
                <ProfileImageUpload 
                  currentImage={profileImage}
                  userName={name}
                  onUploadSuccess={(url) => setProfileImage(url)}
                />
              </div>
            </div>
          </section>

          {/* Professional Details */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell students about your professional background and how you can help them..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all resize-y"
                />
              </div>

              <div className="space-y-2 max-w-xs">
                <label className="text-sm font-semibold text-gray-900">Years of Experience</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-4 top-2.5 text-sm text-gray-500 pointer-events-none">years</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-400" /> Expertise
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PREDEFINED_EXPERTISE.map(skill => {
                    const isSelected = expertise.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleExpertiseToggle(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent hover:border-gray-300'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Session Settings & Pricing */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Session Settings & Rates</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Price Per Session</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={pricePerSession}
                      onChange={(e) => setPricePerSession(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                      placeholder="Free"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Leave empty or 0 for free sessions.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Session Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" /> Welcome Message / Instructions
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes for students after they book (e.g., 'Please send me your resume before the session')..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all resize-y"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Auto-Confirm Bookings</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md">
                    Automatically accept all incoming mentor requests. If unchecked, you will need to manually review and approve each session request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoConfirm(!autoConfirm)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                    autoConfirm ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoConfirm ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all disabled:opacity-70 shadow-sm"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorProfilePage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorProfileContent />
    </ProtectedRoute>
  );
}
