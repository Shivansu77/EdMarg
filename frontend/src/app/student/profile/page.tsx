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
      <div className="max-w-5xl pb-16 relative">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Student Profile
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
              <p className="mt-3 text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Manage your personal information and academic background to get better mentor matches.
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Account Role</p>
              <p className="mt-1 text-base font-extrabold text-slate-900">Student</p>
            </div>
          </div>
        </div>

        <section className="mb-10 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Profile Completion</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{completionPct}% complete</p>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[240px]">Complete all fields for better mentor recommendations.</p>
          </div>
          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100/50">
            <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-500 transition-all duration-1000" style={{ width: `${completionPct}%` }} />
          </div>
        </section>

        {errorMsg && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm p-4 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">{errorMsg}</p>
              {errorMsg.toLowerCase().includes('load profile') && (
                <button
                  type="button"
                  onClick={fetchProfile}
                  className="mt-2 text-xs font-bold text-red-700 underline underline-offset-4"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-200/50 bg-emerald-50/80 backdrop-blur-sm p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-10">
          {/* Personal Information */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3">
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Personal Information</h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your public identity on the platform</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={NAME_MAX_LENGTH}
                    required
                    className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{name.length}/{NAME_MAX_LENGTH} Characters</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-400 text-sm font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Profile Picture</label>
                <div className="rounded-[2rem] border-2 border-dashed border-emerald-100 bg-emerald-50/30 p-8 transition-all hover:bg-emerald-50/50">
                  <ProfileImageUpload 
                    currentImage={profileImage}
                    userName={name}
                    onUploadSuccess={(url) => setProfileImage(url)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Academic Background */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Academic Background</h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your current education status</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3 max-w-md">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Class Level</label>
                <div className="relative">
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your education level...</option>
                    {CLASS_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Sparkles className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interests */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Career Interests</h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">What you want to explore or learn</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">Select the fields you are interested in exploring or getting mentorship in. These help us curate your dashboard experience.</p>
              
              <div className="flex flex-wrap gap-3">
                {PREDEFINED_INTERESTS.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
                        isSelected 
                          ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105' 
                          : 'bg-white/60 text-slate-500 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50'
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
          <div className="sticky bottom-8 z-10 flex flex-wrap items-center justify-end gap-6 rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-3xl ring-1 ring-black/[0.03]">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="px-6 py-3 text-sm font-bold text-slate-500 transition-all hover:text-slate-950 disabled:opacity-50 uppercase tracking-widest"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex h-14 items-center gap-4 rounded-2xl bg-slate-950 px-12 text-base font-bold text-white shadow-2xl shadow-slate-950/30 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Changes</>
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
