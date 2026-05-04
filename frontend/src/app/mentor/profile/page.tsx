'use client';

import React, { useState, useEffect } from 'react';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
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
  MessageSquare,
  Globe,
  Building2,
  MapPin,
  GraduationCap
} from 'lucide-react';

// Predefined set of common technical/career interests/expertise
const PREDEFINED_LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi',
  'Kannada', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu', 'Odia',
];

const PREDEFINED_EXPERTISE = [
  'Software Engineering', 'Data Science', 'Machine Learning', 
  'Product Management', 'Design', 'Marketing', 'Finance', 
  'Consulting', 'Entrepreneurship', 'Web Development', 
  'Mobile Development', 'Cybersecurity', 'Cloud Computing',
  'DevOps', 'System Design', 'Interview Prep', 'Career Guidance'
];

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

interface MentorProfile {
  name: string;
  profileImage: string;
  emailVerification?: {
    isVerified?: boolean;
    lastSentAt?: string;
    verifiedAt?: string;
  };
  mentorProfile?: {
    linkedinUrl?: string;
    bio?: string;
    experienceYears?: number;
    expertise?: string[];
    pricePerSession?: number;
    sessionDuration?: number;
    autoConfirm?: boolean;
    sessionNotes?: string;
    languages?: string[];
    currentCompany?: string;
    currentTitle?: string;
    location?: string;
    education?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
  };
}

function MentorProfileContent() {
  const { user, updateUser } = useAuth();
  
  // Form State - Personal
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Form State - Professional
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [expertise, setExpertise] = useState<string[]>([]);
  
  // Form State - Session Settings removed to be in Settings page instead
  // Form State - About You
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpResendAvailableAt, setOtpResendAvailableAt] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
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
          setEmailVerified(Boolean(userData.emailVerification?.isVerified));
          setOtpResendAvailableAt(
            userData.emailVerification?.lastSentAt
              ? new Date(userData.emailVerification.lastSentAt).getTime() + OTP_RESEND_COOLDOWN_MS
              : null
          );
          
          const mProfile = userData.mentorProfile || {};
          setLinkedinUrl(mProfile.linkedinUrl || '');
          setBio(mProfile.bio || '');
          setExperienceYears(mProfile.experienceYears || '');
          setExpertise(mProfile.expertise || []);
          
          setLanguages(mProfile.languages?.length ? mProfile.languages : ['English']);
          setCurrentCompany(mProfile.currentCompany || '');
          setCurrentTitle(mProfile.currentTitle || '');
          setLocation(mProfile.location || '');
          setEducation(mProfile.education || '');
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

  useEffect(() => {
    if (!otpResendAvailableAt || otpResendAvailableAt <= Date.now()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [otpResendAvailableAt]);

  const otpCooldownSeconds = otpResendAvailableAt
    ? Math.max(0, Math.ceil((otpResendAvailableAt - currentTime) / 1000))
    : 0;
  const canSendOtp = !sendingOtp && otpCooldownSeconds === 0;

  const handleExpertiseToggle = (skill: string) => {
    setExpertise(prev => 
      prev.includes(skill) 
        ? prev.filter(i => i !== skill)
        : [...prev, skill]
    );
  };

  const handleLanguageToggle = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
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
        linkedinUrl,
        bio,
        experienceYears: experienceYears === '' ? 0 : Number(experienceYears),
        expertise,
        languages,
        currentCompany,
        currentTitle,
        location,
        education
      };

      const res = await apiClient.put<MentorProfile>('/api/v1/users/profile', payload);
      
      if (res.success) {
        setSuccessMsg('PROFILE SAVED SUCCESSFULLY');
        updateUser({ name, profileImage, profileImageUpdatedAt: Date.now(), mentorProfile: res.data?.mentorProfile, emailVerification: res.data?.emailVerification });
        
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

  const handleSendOtp = async () => {
    if (!canSendOtp) {
      return;
    }

    setSendingOtp(true);
    setErrorMsg('');
    const res = await apiClient.post('/api/v1/users/email/send-otp');
    setSendingOtp(false);

    if (!res.success) {
      if ((res.error || res.message || '').includes('Please wait a minute')) {
        const nextAvailableAt = Date.now() + OTP_RESEND_COOLDOWN_MS;
        setCurrentTime(Date.now());
        setOtpResendAvailableAt(nextAvailableAt);
      }
      setErrorMsg(res.error || res.message || 'Unable to send OTP');
      return;
    }

    const sentAt = Date.now();
    setCurrentTime(sentAt);
    setOtpResendAvailableAt(sentAt + OTP_RESEND_COOLDOWN_MS);
    setSuccessMsg(res.message || 'OTP sent to your email');
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMsg('Enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    setErrorMsg('');
    const res = await apiClient.post<MentorProfile>('/api/v1/users/email/verify-otp', { otp: otp.trim() });
    setVerifyingOtp(false);

    if (!res.success || !res.data) {
      setErrorMsg(res.error || res.message || 'Unable to verify OTP');
      return;
    }

    setEmailVerified(true);
    setOtp('');
    setSuccessMsg('EMAIL VERIFIED SUCCESSFULLY');
    updateUser({ emailVerification: res.data.emailVerification, mentorProfile: res.data.mentorProfile });
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
      <div className="max-w-4xl pb-16 relative">
        <div className="mb-10 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Professional Identity
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">Mentor Profile</h1>
              <p className="mt-3 text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Manage your professional details, session rates, and booking preferences. Your profile is your brand.
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Verification Status</p>
              <p className={`mt-1 text-base font-extrabold ${approvalStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
              </p>
            </div>
          </div>
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

        {!emailVerified && (
          <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Verify your email before approval</p>
                <p className="mt-1 text-sm text-blue-800">
                  We need a verified email so admins and students can contact you reliably.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!canSendOtp}
                  className="rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-70"
                >
                  {sendingOtp
                    ? 'Sending OTP...'
                    : otpCooldownSeconds > 0
                      ? `Resend in ${otpCooldownSeconds}s`
                      : 'Send OTP'}
                </button>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter OTP"
                  className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                  className="rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
              {otpCooldownSeconds > 0 && (
                <p className="text-sm text-blue-800">
                  You can request a new OTP in {otpCooldownSeconds}s.
                </p>
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
                    required
                    className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                  />
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

          {/* Professional Details */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Professional Details</h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your experience and background</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">LinkedIn Profile</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell students about your professional journey..."
                  className="w-full p-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      placeholder="e.g. Google, Meta"
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Title</label>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Years of Experience</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Core Expertise</label>
                <div className="flex flex-wrap gap-3">
                  {PREDEFINED_EXPERTISE.map(skill => {
                    const isSelected = expertise.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleExpertiseToggle(skill)}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
                          isSelected 
                            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105' 
                            : 'bg-white/60 text-slate-500 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50'
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

          {/* Session Settings section moved to Settings page */}
          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 leading-relaxed">
                Updates may trigger manual admin review
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex h-16 items-center justify-center gap-4 rounded-2xl bg-slate-950 px-12 text-base font-bold text-white shadow-2xl shadow-slate-950/30 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Portfolio</>}
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
