'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import { getDefaultAuthenticatedPath, isProfileComplete, type AuthProfileUser } from '@/utils/auth-profile';

type Role = 'student' | 'mentor';

interface ProfileResponse extends AuthProfileUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  mentorProfile?: AuthProfileUser['mentorProfile'] & {
    bio?: string;
  };
}

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

  const title = useMemo(
    () => (role === 'mentor' ? 'Finish your mentor setup' : 'Finish your student setup'),
    [role]
  );

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
      studentProfile: response.data.studentProfile || undefined,
      mentorProfile: response.data.mentorProfile || undefined,
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

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-cyan-50">
      <div className="border-b border-emerald-100/70 bg-white/80 px-6 py-4 backdrop-blur">
        <Logo />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-4xl items-center px-6 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">One last step</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Google gives us your name, email, and profile photo. We collect the rest here so we can route you to the right experience.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    role === 'student'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  I am a student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mentor')}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    role === 'mentor'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  I am a mentor
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
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
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Phone number
                <input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  placeholder="10-digit phone number"
                />
              </label>

              {role === 'student' ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Class or level
                    <input
                      value={classLevel}
                      onChange={(event) => setClassLevel(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Class 12, Graduate, Early career"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Interests
                    <input
                      value={interests}
                      onChange={(event) => setInterests(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Design, Engineering, Finance"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    LinkedIn profile link
                    <input
                      value={linkedinUrl}
                      onChange={(event) => setLinkedinUrl(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Expertise
                    <input
                      value={expertise}
                      onChange={(event) => setExpertise(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Career coaching, product, software engineering"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Short bio
                    <textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      placeholder="Share the experience and guidance you bring."
                    />
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save and continue'}
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-center rounded-[2rem] bg-slate-900 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
            <h2 className="text-2xl font-semibold tracking-tight">Why we ask for more details</h2>
            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
              <p>Google does not reliably provide role, class level, expertise, LinkedIn, pricing, or mentoring preferences.</p>
              <p>Students need learning context so we can show the right dashboard and mentor recommendations.</p>
              <p>Mentors need professional details so we can send them into review, display their profile, and unlock booking tools after approval.</p>
            </div>

            <Link href="/login" className="mt-8 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
