'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { resolveApiBaseUrl } from '@/utils/api-base';
import toast from 'react-hot-toast';
import { Briefcase, Loader2, Link2, CheckCircle, AlertCircle, Clock, GraduationCap } from 'lucide-react';

function CareersContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Application fields
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  
  // Application status
  const [approvalStatus, setApprovalStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const API_BASE_URL = resolveApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data?.mentorProfile?.approvalStatus) {
            setApprovalStatus(result.data.mentorProfile.approvalStatus);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setFetching(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!linkedinUrl.trim()) {
      toast.error('LinkedIn profile link is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        expertise: expertise.split(',').map((v) => v.trim()).filter((v) => v !== ''),
        bio,
        linkedinUrl: linkedinUrl.trim(),
        experienceYears: Number(experienceYears) || 0,
      };

      const API_BASE_URL = resolveApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/users/apply-mentor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      setApprovalStatus('pending');
      
      // Update local storage user data
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser) {
        storedUser.mentorProfile = {
          ...storedUser.mentorProfile,
          approvalStatus: 'pending'
        };
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('edmarg-auth-user-change'));
      }
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout userName="Careers">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Careers">
      <div className="min-h-screen bg-slate-50/50 pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-white border-b border-slate-200 px-6 sm:px-12 py-16 lg:py-20">
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/40 blur-[100px]" />
          
          <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
              <Briefcase size={14} />
              Career Opportunities
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Become an <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">EdMarg Mentor</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Share your expertise, build your personal brand, and guide the next generation of professionals. Apply to join our exclusive network of industry experts.
            </p>
          </div>
        </div>

        <div className="px-6 pt-10 sm:px-12 max-w-3xl mx-auto">
          {approvalStatus === 'pending' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
              <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-8 border-amber-50/50">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Under Review</h2>
              <p className="text-slate-600 leading-relaxed max-w-lg mx-auto">
                Thank you for applying to become an EdMarg mentor! Our team is currently reviewing your application and LinkedIn profile. This usually takes 1-2 business days. We&apos;ll notify you via email once a decision is made.
              </p>
            </div>
          ) : approvalStatus === 'rejected' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
              <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-8 border-red-50/50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Status Update</h2>
              <p className="text-slate-600 leading-relaxed max-w-lg mx-auto mb-8">
                Thank you for your interest. At this time, we are unable to accept your application to become a mentor. We encourage you to continue building your professional experience.
              </p>
              <button 
                onClick={() => setApprovalStatus('none')}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
              >
                Submit a New Application
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 sm:p-10 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Mentor Application</h2>
                <p className="text-sm text-slate-500 mt-1">Tell us about your professional background and expertise.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                <div className="space-y-2">
                  <label htmlFor="linkedinUrl" className="block text-sm font-bold text-slate-900">
                    LinkedIn Profile URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="linkedinUrl"
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">We use your LinkedIn profile to verify your professional experience.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="expertise" className="block text-sm font-bold text-slate-900">
                    Areas of Expertise
                  </label>
                  <input
                    id="expertise"
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Product Management, React, System Design"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  <p className="text-xs text-slate-500">Comma-separated list of your core skills.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="experienceYears" className="block text-sm font-bold text-slate-900">
                      Years of Experience
                    </label>
                    <input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-bold text-slate-900">
                    Short Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about your journey and how you can help students..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    rows={4}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CareersPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <CareersContent />
    </ProtectedRoute>
  );
}
