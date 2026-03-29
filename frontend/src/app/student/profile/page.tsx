'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import Image from 'next/image';
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

function ProfileContent() {
  const { user } = useAuth();
  
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

  // Fetch complete user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<UserProfile>('/api/v1/users/me');
        if (res.success && res.data) {
          const userData = res.data;
          setName(userData.name || '');
          setProfileImage(userData.profileImage || '');
          setClassLevel(userData.studentProfile?.classLevel || '');
          setInterests(userData.studentProfile?.interests || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
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
        classLevel,
        interests
      };

      const res = await apiClient.put('/api/v1/users/profile', payload);
      
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        
        // Dispatch event to update Sidebar/Navbar immediately
        if (typeof window !== 'undefined') {
          // Update localStorage cache directly so AuthContext picks it up
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              parsed.name = name;
              parsed.profileImage = profileImage;
              localStorage.setItem('user', JSON.stringify(parsed));
              window.dispatchEvent(new Event('edmarg-auth-user-change'));
            } catch (e) {
              console.error('Failed to update local cache', e);
            }
          }
        }
        
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
      <div className="max-w-4xl pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and academic background to get better mentor matches.
          </p>
        </div>

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
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Profile Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                />
                {profileImage && (
                  <div className="mt-4 flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-sm bg-white border border-gray-100">
                      <Image 
                        src={profileImage} 
                        alt="Profile Preview" 
                        fill 
                        className="object-cover"
                        unoptimized={!profileImage.includes('images.unsplash.com') && !profileImage.includes('i.pravatar.cc')}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Image Preview</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Academic Background */}
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Academic Background</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-semibold text-gray-900">Current Class Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all appearance-none"
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
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Career Interests</h2>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Select the fields you are interested in exploring or getting mentorship in.</p>
              
              <div className="flex flex-wrap gap-2.5">
                {PREDEFINED_INTERESTS.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent hover:border-gray-300'
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
