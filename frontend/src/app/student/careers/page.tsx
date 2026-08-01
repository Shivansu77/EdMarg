'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import toast from 'react-hot-toast';
import {
  Briefcase, Loader2, Link2, CheckCircle2, AlertCircle, Clock,
  Building2, MapPin, GraduationCap, Award, Edit3,
  Sparkles, ArrowRight, ArrowLeft, ShieldCheck, UserCheck, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function BecomeAMentorContent() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(1);

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

      toast.success(editing ? 'Application updated successfully!' : 'Application submitted successfully!');
      setApprovalStatus('pending');
      setSubmittedProfile({ ...payload, approvalStatus: 'pending' });
      setEditing(false);
      setStep(1);
      refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;
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
      setStep(1);
      
      // Reset form fields
      setLinkedinUrl('');
      setCurrentTitle('');
      setCurrentCompany('');
      setExperienceYears('');
      setLocation('');
      setEducation('');
      setExpertise('');
      setBio('');

      refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const startReapply = () => {
    setEditing(true);
    setStep(1);
    if (submittedProfile) {
      populateForm(submittedProfile);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout userName="Become a Mentor">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading profile status...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Become a Mentor">
      <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl bg-slate-900 p-8 sm:p-10 text-white overflow-hidden shadow-sm border border-slate-800">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Teach on EdMarg
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Share Knowledge, Guide Minds
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Become a verified industry expert on EdMarg. Guide aspiring students, host 1-on-1 sessions, and help shape the careers of tomorrow.
            </p>
          </div>
        </div>

        {/* ── APPROVED STATE ── */}
        {approvalStatus === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center shadow-sm"
          >
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Application is Approved! 🎉</h2>
            <p className="text-slate-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Congratulations! Your mentor profile is now active. Students can find you and book mentorship sessions.
            </p>
            <a
              href="/mentor/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.01] active:scale-95"
            >
              Go to Mentor Dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        )}

        {/* ── PENDING STATE ── */}
        {approvalStatus === 'pending' && !editing && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-100 mb-1.5">
                      Under Review
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">Application Received</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                      We are currently reviewing your professional credentials. Approval typically takes 24-48 hours. You will receive an email update once verified.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Details
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-all disabled:opacity-60"
                  >
                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Application Overview */}
            {submittedProfile && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Submitted Details
                  </h3>
                </div>

                <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn Profile</p>
                    <a
                      href={submittedProfile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <Link2 className="w-4 h-4 shrink-0 text-emerald-500" /> {submittedProfile.linkedinUrl}
                    </a>
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

                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Education</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> {submittedProfile.education || 'Not provided'}
                    </p>
                  </div>

                  {submittedProfile.expertise && submittedProfile.expertise.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Areas of Expertise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {submittedProfile.expertise.map((exp) => (
                          <span key={exp} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {submittedProfile.bio && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Short Bio</p>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {submittedProfile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── REJECTED STATE ── */}
        {approvalStatus === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Application Rejected</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Thank you for your interest. Unfortunately, your application was not approved at this time.
                </p>
                {submittedProfile?.rejectionReason && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
                    <p className="text-xs font-bold uppercase text-red-500 mb-1">Admin Feedback</p>
                    <p className="text-sm text-red-800 font-medium">{submittedProfile.rejectionReason}</p>
                  </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                    Delete Application
                  </button>
                  <button
                    onClick={startReapply}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
                  >
                    Re-apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEPPED FORM (FOR NEW OR EDITING APPLICANTS) ── */}
        {(approvalStatus === 'none' || editing) && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Step Wizard Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editing ? 'Update Mentor Details' : 'Become a Mentor'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step {step} of 3 — {step === 1 ? 'Introduction & LinkedIn' : step === 2 ? 'Professional Profile' : 'Mentorship Goals'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              
              {/* STEP 1: Basic Intro & Linkedin */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100/50 p-5 space-y-3">
                    <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Why join EdMarg as a Mentor?
                    </h3>
                    <ul className="text-xs text-emerald-700 space-y-2 list-disc list-inside leading-relaxed">
                      <li>Share actionable guidance and career lessons directly with students.</li>
                      <li>Monetize your expertise by setting your own 1-on-1 session pricing.</li>
                      <li>Manage bookings and video sessions cleanly in one place.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="linkedinUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      LinkedIn URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/in/username"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="experienceYears" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
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
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Professional Profile */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="currentTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Current Role / Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="currentTitle"
                          type="text"
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          placeholder="e.g. Software Architect"
                          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="currentCompany" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Organization / Company
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="currentCompany"
                          type="text"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="e.g. Google"
                          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
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
                          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="education" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Education
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="education"
                          type="text"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="e.g. B.Tech, IIT Bombay"
                          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="expertise" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Skills & Core Expertise
                    </label>
                    <input
                      id="expertise"
                      type="text"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. System Design, Product Management, React, Career Strategy"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                    <p className="text-[11px] text-slate-400">Separate multiple skills with commas</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Bio & Philosophy */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Short Bio / Mentorship Philosophy
                    </label>
                    <textarea
                      id="bio"
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a brief overview of your background, experience, and what you aim to share with students..."
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step Navigation Controls */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setStep(1);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 1 && !linkedinUrl.trim()) {
                          toast.error('Please fill in your LinkedIn profile URL');
                          return;
                        }
                        setStep(step + 1);
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-60 active:scale-95"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><UserCheck className="w-4 h-4" /> Submit Application</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default function BecomeAMentorPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <BecomeAMentorContent />
    </ProtectedRoute>
  );
}
