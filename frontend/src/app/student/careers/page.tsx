'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import toast from 'react-hot-toast';
import {
  Briefcase, Loader2, Link2, CheckCircle2, AlertCircle, Clock,
  XCircle, Building2, MapPin, GraduationCap, Award, Edit3,
  Sparkles, ArrowRight, ShieldCheck, UserCheck
} from 'lucide-react';

interface MentorProfile {
  approvalStatus?: 'pending' | 'approved' | 'rejected' | string | null;
  expertise?: string[];
  bio?: string;
  experienceYears?: number;
  linkedinUrl?: string;
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
  education?: string;
  rejectionReason?: string;
}

function CareersContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);

  // Form State
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');

  const [approvalStatus, setApprovalStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [submittedProfile, setSubmittedProfile] = useState<MentorProfile | null>(null);

  const populateForm = useCallback((profile: MentorProfile) => {
    setLinkedinUrl(profile.linkedinUrl || '');
    setCurrentTitle(profile.currentTitle || '');
    setCurrentCompany(profile.currentCompany || '');
    setExperienceYears(profile.experienceYears != null ? String(profile.experienceYears) : '');
    setLocation(profile.location || '');
    setEducation(profile.education || '');
    setExpertise(profile.expertise?.join(', ') || '');
    setBio(profile.bio || '');
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setFetching(true);
      const res = await apiClient.get<any>('/api/v1/users/me');

      if (res.success && res.data) {
        const profile: MentorProfile | undefined = res.data?.mentorProfile;
        const status = profile?.approvalStatus;

        if (status === 'pending' || status === 'approved' || status === 'rejected') {
          setApprovalStatus(status as any);
          setSubmittedProfile(profile || null);
          if (profile) populateForm(profile);
        } else {
          setApprovalStatus('none');
          setSubmittedProfile(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setFetching(false);
    }
  }, [populateForm]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setFetching(false);
    }
  }, [user, fetchUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!linkedinUrl.trim()) {
      toast.error('LinkedIn profile URL is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        expertise: expertise.split(',').map((v) => v.trim()).filter(Boolean),
        bio: bio.trim(),
        linkedinUrl: linkedinUrl.trim(),
        experienceYears: Number(experienceYears) || 0,
        currentCompany: currentCompany.trim(),
        currentTitle: currentTitle.trim(),
        location: location.trim(),
        education: education.trim(),
      };

      const res = await apiClient.put<any>('/api/v1/users/apply-mentor', payload);

      if (!res.success) {
        throw new Error(res.message || res.error || 'Failed to submit application');
      }

      toast.success(editing ? 'Application updated successfully!' : 'Mentor application submitted successfully!');
      setApprovalStatus('pending');
      setSubmittedProfile({ ...payload, approvalStatus: 'pending' });
      setEditing(false);

      if (typeof window !== 'undefined') {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && typeof storedUser === 'object') {
          storedUser.mentorProfile = { ...storedUser.mentorProfile, ...payload, approvalStatus: 'pending' };
          storedUser.role = 'mentor';
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        window.dispatchEvent(new Event('edmarg-auth-user-change'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw your mentor application?')) return;
    setWithdrawing(true);

    try {
      const res = await apiClient.delete<any>('/api/v1/users/withdraw-mentor');

      if (!res.success) {
        throw new Error(res.message || res.error || 'Failed to withdraw application');
      }

      toast.success('Application withdrawn successfully.');
      setApprovalStatus('none');
      setSubmittedProfile(null);
      setEditing(false);
      setLinkedinUrl('');
      setCurrentTitle('');
      setCurrentCompany('');
      setExperienceYears('');
      setLocation('');
      setEducation('');
      setExpertise('');
      setBio('');

      if (typeof window !== 'undefined') {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser && typeof storedUser === 'object') {
          storedUser.mentorProfile = null;
          storedUser.role = 'student';
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        window.dispatchEvent(new Event('edmarg-auth-user-change'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout userName="Careers">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile status...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Careers">
      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Mentor Program
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Share Knowledge, Lead Minds on EdMarg
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Join top industry experts mentoring students, building personal brands, and conducting 1-on-1 sessions.
            </p>
          </div>
        </div>

        {/* ── APPROVED STATE ── */}
        {approvalStatus === 'approved' && (
          <div className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 border-4 border-emerald-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">You&apos;re an Approved EdMarg Mentor! 🎉</h2>
            <p className="text-slate-600 max-w-lg mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Your mentor profile is live. Students can now discover your profile, book 1-on-1 sessions, and view your availability.
            </p>
            <a
              href="/mentor/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Go to Mentor Dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* ── PENDING STATE ── */}
        {approvalStatus === 'pending' && !editing && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-amber-50/70 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-xs font-bold mb-1">
                      Status: Under Review
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">Application Received</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                      Our team is reviewing your application details. Approval usually takes 1-2 business days. You will be notified via email.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold shadow-sm transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Details
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-all disabled:opacity-60"
                  >
                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Application Overview */}
            {submittedProfile && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Submitted Details
                  </h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn Profile</p>
                    {submittedProfile.linkedinUrl ? (
                      <a
                        href={submittedProfile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 break-all"
                      >
                        <Link2 className="w-4 h-4 shrink-0 text-emerald-500" /> {submittedProfile.linkedinUrl}
                      </a>
                    ) : (
                      <p className="text-sm text-red-500 font-medium">Missing LinkedIn URL</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Title</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {submittedProfile.currentTitle || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Company</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" /> {submittedProfile.currentCompany || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" /> {submittedProfile.experienceYears ? `${submittedProfile.experienceYears} Years` : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {submittedProfile.location || 'Not provided'}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Education</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> {submittedProfile.education || 'Not provided'}
                    </p>
                  </div>

                  {submittedProfile.expertise && submittedProfile.expertise.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Areas of Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {submittedProfile.expertise.map((exp) => (
                          <span key={exp} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {submittedProfile.bio && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {submittedProfile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── REJECTED STATE ── */}
        {approvalStatus === 'rejected' && (
          <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Application Status: Rejected</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Thank you for your interest. Unfortunately, your application was not approved at this time.
                </p>
                {submittedProfile?.rejectionReason && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs font-bold uppercase text-red-500 mb-1">Feedback from Admin</p>
                    <p className="text-sm text-red-800 font-medium">{submittedProfile.rejectionReason}</p>
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
                  >
                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Re-apply Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATION FORM (FOR NEW OR EDITING) ── */}
        {(approvalStatus === 'none' || editing) && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editing ? 'Update Your Mentor Application' : 'Mentor Application Form'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {editing ? 'Modify your submitted details below' : 'Fill in your details for verification and approval'}
                </p>
              </div>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* LinkedIn */}
              <div className="space-y-2">
                <label htmlFor="linkedinUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  LinkedIn Profile URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="currentTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="currentTitle"
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="currentCompany" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Organization / Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="currentCompany"
                      type="text"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Google, Microsoft, Startup"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Experience & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="experienceYears" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <label htmlFor="education" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Education Background
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="education"
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech in CS, IIT Bombay"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <label htmlFor="expertise" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Areas of Expertise
                </label>
                <input
                  id="expertise"
                  type="text"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g. React, System Design, Product Management, Career Strategy"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
                <p className="text-xs text-slate-400">Separate multiple skills with commas</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Short Bio / Mentorship Philosophy
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your experience and how you can guide them..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 active:scale-95"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><UserCheck className="w-4 h-4" /> {editing ? 'Update Application' : 'Submit Mentor Application'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

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
