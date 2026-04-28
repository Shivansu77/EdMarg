'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Loader2,
  MailCheck,
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
    <div className="min-h-screen bg-[#f7f8f4]">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo />
          <div className="hidden text-sm font-medium text-slate-500 md:block">
            Complete profile
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Step 2 of 2</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Google gave us your basic details. Add the rest so we can set up your account properly.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Summary</p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-900">Role</p>
                  <p className="mt-1">{role === 'mentor' ? 'Mentor setup' : 'Student setup'}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Email status</p>
                  <p className="mt-1">{emailVerified ? 'Verified' : 'Pending verification'}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Next</p>
                  <p className="mt-1">{role === 'mentor' ? 'Admin review after completion' : 'Direct dashboard access after completion'}</p>
                </div>
              </div>
            </div>

            <Link href="/login" className="inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900">
              Back to login
            </Link>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-slate-100 pb-6">
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Complete your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{helperText}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {roleCards.map(({ role: roleValue, title: cardTitle, subtitle, icon: Icon }) => {
                const active = role === roleValue;

                return (
                  <button
                    key={roleValue}
                    type="button"
                    onClick={() => setRole(roleValue)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2 ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{cardTitle}</p>
                        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    value={email}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Phone number
                  <input
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                    placeholder="10-digit phone number"
                  />
                </label>
              </div>

              {role === 'mentor' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl p-2 ${emailVerified ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>
                        <MailCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Verify email</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {emailVerified
                            ? 'Your email is verified.'
                            : 'Verify your email before your mentor account can move into review.'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  {!emailVerified && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!canSendOtp}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-70"
                      >
                        {sendingOtp
                          ? 'Sending...'
                          : otpCooldownSeconds > 0
                            ? `Resend in ${otpCooldownSeconds}s`
                            : 'Send OTP'}
                      </button>
                      <input
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {!emailVerified && otpCooldownSeconds > 0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      You can request a new OTP in {otpCooldownSeconds}s.
                    </p>
                  )}
                </div>
              )}

              {role === 'student' ? (
                <div className="grid gap-5">
                  <label className="block text-sm font-medium text-slate-700">
                    Class or level
                    <input
                      value={classLevel}
                      onChange={(event) => setClassLevel(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Class 12, Graduate, Early career"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Interests
                    <input
                      value={interests}
                      onChange={(event) => setInterests(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Design, engineering, finance"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-5">
                  <label className="block text-sm font-medium text-slate-700">
                    LinkedIn profile link
                    <input
                      value={linkedinUrl}
                      onChange={(event) => setLinkedinUrl(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Expertise
                    <input
                      value={expertise}
                      onChange={(event) => setExpertise(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Career coaching, system design, product strategy"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Short bio
                    <textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                      placeholder="Describe your background and what kind of students you help."
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {role === 'mentor'
                    ? 'Mentor accounts need email verification and admin review.'
                    : 'You can update these details later from your profile.'}
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save and continue'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
