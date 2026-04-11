'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { 
  UserCircle, 
  Mail, 
  GraduationCap, 
  Sparkles, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CLASS_LEVELS = [
  'High School',
  'Undergraduate / College',
  'Graduate / Masters',
  'Professional / Corporate',
  'Other'
];

// Predefined set of common technical/career interests 
const PREDEFINED_INTERESTS = [
  'Software Engineering', 'Data Science', 'Machine Learning', 
  'Product Management', 'Design', 'Marketing', 'Finance', 
  'Consulting', 'Entrepreneurship', 'Web Development', 
  'Mobile Development', 'Cybersecurity', 'Cloud Computing'
];

interface UserProfile {
  name: string;
  profileImage: string;
  studentProfile?: {
    classLevel: string;
    interests: string[];
  };
}

const NAME_MAX_LENGTH = 80;

function ProfileContent() {
  const { user, updateUser } = useAuth();
  
  // Form State
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);

  // Fetch complete user profile on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await apiClient.get<UserProfile>('/api/v1/users/me');
      if (res.success && res.data) {
        const userData = {
          name: res.data.name || '',
          profileImage: res.data.profileImage || '',
          studentProfile: {
            classLevel: res.data.studentProfile?.classLevel || '',
            interests: res.data.studentProfile?.interests || [],
          },
        };

        setName(userData.name);
        setProfileImage(userData.profileImage);
        setClassLevel(userData.studentProfile.classLevel);
        setInterests(userData.studentProfile.interests);
        setInitialProfile(userData);
      } else {
        setErrorMsg(res.message || 'Failed to load profile.');
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setErrorMsg('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isDirty =
    !initialProfile ||
    name !== initialProfile.name ||
    profileImage !== initialProfile.profileImage ||
    classLevel !== (initialProfile.studentProfile?.classLevel || '') ||
    JSON.stringify([...interests].sort()) !== JSON.stringify([...(initialProfile.studentProfile?.interests || [])].sort());

  const completedFields = [
    Boolean(name.trim()),
    Boolean(profileImage),
    Boolean(classLevel),
    interests.length > 0,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 4) * 100);

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleReset = () => {
    if (!initialProfile) {
      return;
    }

    setName(initialProfile.name || '');
    setProfileImage(initialProfile.profileImage || '');
    setClassLevel(initialProfile.studentProfile?.classLevel || '');
    setInterests(initialProfile.studentProfile?.interests || []);
    setErrorMsg('');
    setSuccessMsg('Changes reverted.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMsg('Name is required.');
      setSaving(false);
      return;
    }

    if (!classLevel) {
      setErrorMsg('Please select your class level.');
      setSaving(false);
      return;
    }

    if (interests.length === 0) {
      setErrorMsg('Please add at least one interest.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        profileImage,
        classLevel,
        interests
      };

      const res = await apiClient.put('/api/v1/users/profile', payload);
      
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        updateUser({ name: trimmedName, profileImage, profileImageUpdatedAt: Date.now() });
        setInitialProfile({
          name: trimmedName,
          profileImage,
          studentProfile: {
            classLevel,
            interests,
          },
        });
        
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
      <DashboardLayout userName="Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Profile">
      <div className="max-w-5xl pb-16">
        <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-100/50 bg-linear-to-br from-white via-slate-50 to-emerald-50/50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Student Profile
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
              <p className="mt-2 text-sm text-slate-600">
                Manage your personal information and academic background to get better mentor matches.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Role</p>
              <p className="mt-1 text-sm font-bold text-slate-900">Student</p>
            </div>
          </div>
        </div>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile Completion</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{completionPct}% complete</p>
            </div>
            <p className="text-xs text-slate-500">Complete all fields for better mentor recommendations.</p>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-500 transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </section>

        {errorMsg && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{errorMsg}</p>
              {errorMsg.toLowerCase().includes('load profile') && (
                <button
                  type="button"
                  onClick={fetchProfile}
                  className="mt-2 text-xs font-semibold text-red-700 underline underline-offset-2"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm font-medium text-green-900">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Personal Information */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <UserCircle className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={NAME_MAX_LENGTH}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">{name.length}/{NAME_MAX_LENGTH}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-900">Profile Picture</label>
                <ProfileImageUpload 
                  currentImage={profileImage}
                  userName={name}
                  onUploadSuccess={(url) => setProfileImage(url)}
                />
              </div>
            </div>
          </section>

          {/* Academic Background */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900">Academic Background</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-semibold text-slate-900">Current Class Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="" disabled>Select your education level...</option>
                  {CLASS_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Interests */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900">Career Interests</h2>
            </div>
            
            <div className="p-6">
              <p className="mb-4 text-sm text-slate-600">Select the fields you are interested in exploring or getting mentorship in.</p>
              
              <div className="flex flex-wrap gap-2.5">
                {PREDEFINED_INTERESTS.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500 ring-offset-2' 
                          : 'border border-transparent bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/5 backdrop-blur">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-70"
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
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ProfileContent />
    </ProtectedRoute>
  );
}
