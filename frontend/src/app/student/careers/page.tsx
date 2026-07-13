'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { resolveApiBaseUrl } from '@/utils/api-base';
import toast from 'react-hot-toast';
import {
  Briefcase, Loader2, Link2, CheckCircle, AlertCircle, Clock,
  XCircle, Building2, MapPin, GraduationCap, Award, Edit3,
} from 'lucide-react';

interface MentorProfile {
  approvalStatus?: string;
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

  // Application fields
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

  const populateForm = (profile: MentorProfile) => {
    setLinkedinUrl(profile.linkedinUrl ?? '');
    setCurrentTitle(profile.currentTitle ?? '');
    setCurrentCompany(profile.currentCompany ?? '');
    setExperienceYears(profile.experienceYears?.toString() ?? '');
    setLocation(profile.location ?? '');
    setEducation(profile.education ?? '');
    setExpertise(profile.expertise?.join(', ') ?? '');
    setBio(profile.bio ?? '');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const API_BASE_URL = resolveApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.ok) {
          const result = await response.json();
          const profile: MentorProfile | undefined = result.data?.mentorProfile;
          const status = profile?.approvalStatus;

          if (status === 'pending' || status === 'approved' || status === 'rejected') {
            setApprovalStatus(status);
            setSubmittedProfile(profile ?? null);
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
    };

    if (user) fetchProfile();
    else setFetching(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        currentCompany: currentCompany.trim(),
        currentTitle: currentTitle.trim(),
        location: location.trim(),
        education: education.trim(),
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
      if (!response.ok) throw new Error(result.message || 'Failed to submit application');

      const newProfile = { ...payload, approvalStatus: 'pending' };
      toast.success(editing ? 'Application updated successfully!' : 'Application submitted successfully!');
      setApprovalStatus('pending');
      setSubmittedProfile(newProfile);
      setEditing(false);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser) {
        storedUser.mentorProfile = { ...storedUser.mentorProfile, approvalStatus: 'pending' };
        localStorage.setItem('user', JSON.stringify(storedUser));
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
      const API_BASE_URL = resolveApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/users/withdraw-mentor`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to withdraw application');

      toast.success('Application withdrawn successfully.');
      setApprovalStatus('none');
      setSubmittedProfile(null);
      setEditing(false);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser) {
        storedUser.mentorProfile = { ...storedUser.mentorProfile, approvalStatus: null };
        localStorage.setItem('user', JSON.stringify(storedUser));
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
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Shared application form (used for new apply + edit while pending)
  const ApplicationForm = ({ isUpdate = false }: { isUpdate?: boolean }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isUpdate ? 'Update Your Application' : 'Mentor Application'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isUpdate
              ? 'Fill in any missing details before the admin reviews your application.'
              : 'Tell us about your professional background and expertise.'}
          </p>
        </div>
        {isUpdate && (
          <button
            onClick={() => setEditing(false)}
            className="shrink-0 ml-4 text-sm font-semibold text-slate-500 hover:text-slate-800 underline"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
        {/* LinkedIn */}
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

        {/* Title + Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="currentTitle" className="block text-sm font-bold text-slate-900">Current Job Title</label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="currentTitle"
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="currentCompany" className="block text-sm font-bold text-slate-900">Current Company</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="currentCompany"
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Google, Microsoft"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Experience + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="experienceYears" className="block text-sm font-bold text-slate-900">Years of Experience</label>
            <div className="relative">
              <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="experienceYears"
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 5"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-bold text-slate-900">Location</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <label htmlFor="education" className="block text-sm font-bold text-slate-900">Education</label>
          <div className="relative">
            <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="education"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech Computer Science, IIT Delhi"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        {/* Expertise */}
        <div className="space-y-2">
          <label htmlFor="expertise" className="block text-sm font-bold text-slate-900">Areas of Expertise</label>
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

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-bold text-slate-900">Short Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about your journey and how you can help students..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            rows={4}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          {isUpdate && (
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 disabled:opacity-60"
            >
              {withdrawing ? <><Loader2 className="h-4 w-4 animate-spin" /> Withdrawing...</> : <><XCircle className="h-4 w-4" /> Withdraw</>}
            </button>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {isUpdate ? 'Updating...' : 'Submitting...'}</>
              ) : (
                isUpdate ? 'Update Application' : 'Submit Application'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

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
              Share your expertise, build your personal brand, and guide the next generation of professionals.
            </p>
          </div>
        </div>

        <div className="px-6 pt-10 sm:px-12 max-w-3xl mx-auto space-y-6">

          {/* ── APPROVED ── */}
          {approvalStatus === 'approved' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
              <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border-8 border-emerald-50/50">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">You&apos;re an Approved Mentor! 🎉</h2>
              <p className="text-slate-600 leading-relaxed max-w-lg mx-auto mb-8">
                Congratulations! Your mentor application has been approved. You can now access your mentor dashboard.
              </p>
              <a href="/mentor/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 shadow-sm">
                Go to Mentor Dashboard
              </a>
            </div>
          )}

          {/* ── PENDING ── */}
          {approvalStatus === 'pending' && !editing && (
            <>
              <div className="bg-white rounded-3xl border border-amber-100 bg-amber-50/30 p-8 shadow-sm">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Application Under Review</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Our team is reviewing your application. This usually takes 1–2 business days. We&apos;ll notify you by email once a decision is made.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" /> Edit / Complete Details
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-60"
                  >
                    {withdrawing ? <><Loader2 className="h-4 w-4 animate-spin" /> Withdrawing...</> : <><XCircle className="h-4 w-4" /> Withdraw</>}
                  </button>
                </div>
              </div>

              {/* Quick summary of what was submitted */}
              {submittedProfile && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Your Submitted Details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">This is what the admin is reviewing</p>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {submittedProfile.linkedinUrl ? (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">LinkedIn</p>
                        <a href={submittedProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cyan-700 hover:underline break-all">
                          {submittedProfile.linkedinUrl}
                        </a>
                      </div>
                    ) : (
                      <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        <p className="text-sm text-amber-700 font-medium">LinkedIn URL is missing. <button onClick={() => setEditing(true)} className="underline font-bold">Add it now</button></p>
                      </div>
                    )}

                    {[
                      { label: 'Current Title', value: submittedProfile.currentTitle, icon: <Briefcase className="w-3.5 h-3.5 text-slate-400" /> },
                      { label: 'Current Company', value: submittedProfile.currentCompany, icon: <Building2 className="w-3.5 h-3.5 text-slate-400" /> },
                      { label: 'Experience', value: submittedProfile.experienceYears != null ? `${submittedProfile.experienceYears} years` : null, icon: <Award className="w-3.5 h-3.5 text-slate-400" /> },
                      { label: 'Location', value: submittedProfile.location, icon: <MapPin className="w-3.5 h-3.5 text-slate-400" /> },
                      { label: 'Education', value: submittedProfile.education, icon: <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                        {value ? (
                          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">{icon} {value}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Not provided</p>
                        )}
                      </div>
                    ))}

                    {submittedProfile.expertise && submittedProfile.expertise.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {submittedProfile.expertise.map(exp => (
                            <span key={exp} className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{exp}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {submittedProfile.bio && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bio</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{submittedProfile.bio}</p>
                      </div>
                    )}

                    {!submittedProfile.currentTitle && !submittedProfile.currentCompany && !submittedProfile.bio && (
                      <div className="sm:col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="text-sm text-slate-600">Your application is incomplete. <button onClick={() => setEditing(true)} className="font-bold text-emerald-600 underline">Complete your profile</button> to improve your chances of approval.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PENDING + EDITING ── */}
          {approvalStatus === 'pending' && editing && <ApplicationForm isUpdate />}

          {/* ── REJECTED ── */}
          {approvalStatus === 'rejected' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-100">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Application Not Accepted</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Thank you for your interest. We encourage you to keep building your experience and try again.
                  </p>
                  {submittedProfile?.rejectionReason && (
                    <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Admin Feedback</p>
                      <p className="text-sm text-red-700">{submittedProfile.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-all"
                >
                  {withdrawing ? <><Loader2 className="h-4 w-4 animate-spin" /> Clearing...</> : 'Clear & Apply Again'}
                </button>
              </div>
            </div>
          )}

          {/* ── FRESH APPLICATION FORM ── */}
          {approvalStatus === 'none' && <ApplicationForm />}

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
