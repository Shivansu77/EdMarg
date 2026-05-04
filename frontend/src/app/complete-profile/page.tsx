'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Loader2,
  MailCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { getDefaultAuthenticatedPath, isProfileComplete, type AuthProfileUser } from '@/utils/auth-profile';

type Role = 'student' | 'mentor';

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const roleCards: Array<{
  role: Role;
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
}> = [
  {
    role: 'student',
    title: 'Student',
    subtitle: 'Get matched faster with the right mentors and a cleaner dashboard setup.',
    icon: GraduationCap,
  },
  {
    role: 'mentor',
    title: 'Mentor',
    subtitle: 'Create a trusted public profile students and admins can confidently rely on.',
    icon: Briefcase,
  },
];

interface ProfileResponse extends AuthProfileUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  emailVerification?: {
    isVerified?: boolean;
    lastSentAt?: string;
    verifiedAt?: string;
  };
  mentorProfile?: AuthProfileUser['mentorProfile'] & {
    bio?: string;
  };
}

const normalizeStudentProfile = (profile: ProfileResponse['studentProfile']) => {
  if (!profile) {
    return undefined;
  }

  const classLevel = profile.classLevel ?? undefined;
  const interests = profile.interests ?? undefined;

  if (!classLevel && !interests?.length) {
    return undefined;
  }

  return {
    classLevel,
    interests,
  };
};

const normalizeMentorProfile = (
  profile: ProfileResponse['mentorProfile']
): {
  linkedinUrl?: string;
  expertise?: string[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
} | undefined => {
  if (!profile) {
    return undefined;
  }

  const linkedinUrl = profile.linkedinUrl ?? undefined;
  const expertise = profile.expertise ?? undefined;
  const approvalStatus =
    profile.approvalStatus === 'pending' ||
    profile.approvalStatus === 'approved' ||
    profile.approvalStatus === 'rejected'
      ? profile.approvalStatus
      : undefined;

  if (!linkedinUrl && !expertise?.length && !approvalStatus) {
    return undefined;
  }

  return {
    linkedinUrl,
    expertise,
    approvalStatus,
  };
};

const syncStoredUser = (user: ProfileResponse) => {
  if (typeof window === 'undefined') {
    return;
  }

  const existingUserRaw = window.localStorage.getItem('user');
  let existingUser = {};

  if (existingUserRaw) {
    try {
      existingUser = JSON.parse(existingUserRaw);
    } catch {
      existingUser = {};
    }
  }

  window.localStorage.setItem(
    'user',
    JSON.stringify({
      ...existingUser,
      ...user,
    })
  );

  window.dispatchEvent(new Event('edmarg-auth-user-change'));
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpResendAvailableAt, setOtpResendAvailableAt] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [role, setRole] = useState<Role>('student');
  const [classLevel, setClassLevel] = useState('');
  const [interests, setInterests] = useState('');
  const [expertise, setExpertise] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const response = await apiClient.get<ProfileResponse>('/api/v1/users/me');

      if (!response.success || !response.data) {
        router.replace('/login');
        return;
      }

      const profile = response.data;
      syncStoredUser(profile);

      if (isProfileComplete(profile)) {
        router.replace(getDefaultAuthenticatedPath(profile));
        return;
      }

      setName(profile.name || '');
      setEmail(profile.email || '');
      setEmailVerified(Boolean(profile.emailVerification?.isVerified));
      setOtpResendAvailableAt(
        profile.emailVerification?.lastSentAt
          ? new Date(profile.emailVerification.lastSentAt).getTime() + OTP_RESEND_COOLDOWN_MS
          : null
      );
      setPhoneNumber(profile.phoneNumber || '');
      setRole(profile.role === 'mentor' ? 'mentor' : 'student');
      setClassLevel(profile.studentProfile?.classLevel || '');
      setInterests((profile.studentProfile?.interests || []).join(', '));
      setExpertise((profile.mentorProfile?.expertise || []).join(', '));
      setBio(profile.mentorProfile?.bio || '');
      setLinkedinUrl(profile.mentorProfile?.linkedinUrl || '');
      setLoading(false);
    };

    void loadProfile();
  }, [router]);

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

  const title = useMemo(
    () => (role === 'mentor' ? 'Finish your mentor setup' : 'Finish your student setup'),
    [role]
  );

  const helperText = useMemo(
    () =>
      role === 'mentor'
        ? 'Add the professional details students and admins need before your mentor account can be reviewed.'
        : 'Add a little context so we can personalize your dashboard and mentor recommendations.',
    [role]
  );

  const otpCooldownSeconds = otpResendAvailableAt
    ? Math.max(0, Math.ceil((otpResendAvailableAt - currentTime) / 1000))
    : 0;
  const canSendOtp = !sendingOtp && otpCooldownSeconds === 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const expertiseList = expertise.split(',').map((value) => value.trim()).filter(Boolean);
    const interestsList = interests.split(',').map((value) => value.trim()).filter(Boolean);

    if (normalizedPhoneNumber && normalizedPhoneNumber.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      setSaving(false);
      return;
    }

    if (role === 'student' && !classLevel.trim()) {
      toast.error('Class or level is required for students');
      setSaving(false);
      return;
    }

    if (role === 'mentor' && !linkedinUrl.trim()) {
      toast.error('LinkedIn profile link is required for mentors');
      setSaving(false);
      return;
    }

    if (role === 'mentor' && expertiseList.length === 0) {
      toast.error('Add at least one area of expertise');
      setSaving(false);
      return;
    }

    if (role === 'mentor' && !emailVerified) {
      toast.error('Please verify your email with OTP before continuing as a mentor');
      setSaving(false);
      return;
    }

    const response = await apiClient.put<ProfileResponse>('/api/v1/users/profile', {
      name: name.trim(),
      phoneNumber: normalizedPhoneNumber,
      role,
      classLevel: role === 'student' ? classLevel.trim() : undefined,
      interests: role === 'student' ? interestsList : undefined,
      expertise: role === 'mentor' ? expertiseList : undefined,
      bio: role === 'mentor' ? bio.trim() : undefined,
      linkedinUrl: role === 'mentor' ? linkedinUrl.trim() : undefined,
    });

    setSaving(false);

    if (!response.success || !response.data) {
      toast.error(response.error || response.message || 'Unable to save your profile');
      return;
    }

    syncStoredUser(response.data);
    updateUser({
      name: response.data.name,
      role: response.data.role as Role,
      phoneNumber: response.data.phoneNumber || '',
      studentProfile: normalizeStudentProfile(response.data.studentProfile),
      mentorProfile: normalizeMentorProfile(response.data.mentorProfile),
      emailVerification: response.data.emailVerification || undefined,
    });

    toast.success('Profile completed successfully');
    router.replace(getDefaultAuthenticatedPath(response.data));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const handleSendOtp = async () => {
    if (!canSendOtp) {
      return;
    }

    setSendingOtp(true);
    const response = await apiClient.post('/api/v1/users/email/send-otp');
    setSendingOtp(false);

    if (!response.success) {
      if ((response.error || response.message || '').includes('Please wait a minute')) {
        const nextAvailableAt = Date.now() + OTP_RESEND_COOLDOWN_MS;
        setCurrentTime(Date.now());
        setOtpResendAvailableAt(nextAvailableAt);
      }
      toast.error(response.error || response.message || 'Unable to send OTP');
      return;
    }

    const sentAt = Date.now();
    setCurrentTime(sentAt);
    setOtpResendAvailableAt(sentAt + OTP_RESEND_COOLDOWN_MS);
    toast.success(response.message || 'OTP sent to your email');
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error('Enter the 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    const response = await apiClient.post<ProfileResponse>('/api/v1/users/email/verify-otp', {
      otp: otp.trim(),
    });
    setVerifyingOtp(false);

    if (!response.success || !response.data) {
      toast.error(response.error || response.message || 'Unable to verify OTP');
      return;
    }

    syncStoredUser(response.data);
    setEmailVerified(true);
    setOtp('');
    updateUser({
      emailVerification: response.data.emailVerification || undefined,
    });
    toast.success('Email verified successfully');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col">
      {/* Dynamic Background Blobs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] h-[400px] w-[400px] rounded-full bg-cyan-100/40 blur-[100px]" />
        <div className="absolute -bottom-[10%] right-[20%] h-[600px] w-[600px] rounded-full bg-emerald-100/30 blur-[140px]" />
      </div>

      <div className="relative z-10 px-6 py-5 border-b border-white/40 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold text-slate-500 tracking-wide md:block">
              {email}
            </span>
            <div className="h-8 w-px bg-slate-200 hidden md:block" />
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              Profile Setup
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 flex-1 w-full flex items-center justify-center">
        <div className="grid gap-12 lg:grid-cols-[320px_1fr] w-full items-start">
          <aside className="space-y-8 lg:sticky lg:top-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                Step 2 of 2
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">{title}</h1>
              <p className="text-base leading-relaxed text-slate-600 font-medium">
                Complete these details to unlock your personalized dashboard and start connecting with mentors.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(16,185,129,0.08)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-5">Configuration</p>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Selected Role</span>
                  <span className="text-sm font-extrabold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{role === 'mentor' ? 'Mentor' : 'Student'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Email Status</span>
                  <span className={`text-sm font-extrabold ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="h-px bg-slate-200/60" />
                <p className="text-xs leading-relaxed text-slate-500 font-medium">
                  {role === 'mentor' 
                    ? 'Mentor profiles require manual admin approval after completion.' 
                    : 'Students get immediate access to the platform.'}
                </p>
              </div>
            </div>

            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-slate-900">
              <span className="h-px w-4 bg-slate-300" /> Back to login
            </Link>
          </aside>

          <section className="rounded-[3rem] border border-white/80 bg-white/40 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Tell us about yourself</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600 font-medium">{helperText}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-12">
              {roleCards.map(({ role: roleValue, title: cardTitle, subtitle, icon: Icon }) => {
                const active = role === roleValue;

                return (
                  <button
                    key={roleValue}
                    type="button"
                    onClick={() => setRole(roleValue)}
                    className={`group relative rounded-3xl border p-6 text-left transition-all duration-300 ${
                      active
                        ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/5'
                        : 'border-white/60 bg-white/30 hover:border-emerald-200 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${active ? 'text-slate-950' : 'text-slate-700'}`}>{cardTitle}</p>
                        <p className={`mt-1 text-sm leading-relaxed ${active ? 'text-slate-600' : 'text-slate-400'} font-medium`}>{subtitle}</p>
                      </div>
                    </div>
                    {active && (
                      <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Full Name</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                    placeholder="e.g. Shivansu Bisht"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Email Address</label>
                  <input
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-slate-400 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-200 pr-3">+91</span>
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-16 pr-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </div>

              {role === 'mentor' && (
                <div className="rounded-[2rem] border border-white bg-emerald-50/30 p-8 ring-1 ring-emerald-500/10">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${emailVerified ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 shadow-sm'}`}>
                        <MailCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-950">Identity Verification</p>
                        <p className="text-sm text-slate-600 font-medium">Required for mentor onboarding</p>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-white/80 text-amber-600 shadow-sm'}`}>
                      {emailVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  {!emailVerified && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!canSendOtp}
                        className="h-14 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                      >
                        {sendingOtp ? '...' : otpCooldownSeconds > 0 ? `${otpCooldownSeconds}s` : 'Send OTP'}
                      </button>
                      <input
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-slate-950 outline-none transition-all focus:border-emerald-400 font-bold tracking-[0.5em] text-center"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp}
                        className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-bold transition-all hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-950/20"
                      >
                        {verifyingOtp ? '...' : 'Verify'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-8">
                {role === 'student' ? (
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Academic Level</label>
                      <input
                        value={classLevel}
                        onChange={(event) => setClassLevel(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                        placeholder="e.g. Final Year B.Tech, Class 12"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Interests & Skills</label>
                      <input
                        value={interests}
                        onChange={(event) => setInterests(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                        placeholder="e.g. UI/UX Design, Python, Product Management"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">LinkedIn Profile</label>
                      <input
                        value={linkedinUrl}
                        onChange={(event) => setLinkedinUrl(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Core Expertise</label>
                      <input
                        value={expertise}
                        onChange={(event) => setExpertise(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium"
                        placeholder="e.g. Backend Architecture, Data Science, GTM Strategy"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 tracking-wide ml-1 uppercase text-[10px]">Professional Bio</label>
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        className="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-slate-950 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-300 font-medium resize-none"
                        placeholder="Tell students about your journey and how you can help them..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  {role === 'mentor'
                    ? 'Account enters admin review after save'
                    : 'Changes take effect immediately'}
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-10 text-base font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save and Continue'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
