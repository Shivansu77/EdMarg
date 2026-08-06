'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import toast from 'react-hot-toast';
import {
  Loader2, CheckCircle2, AlertCircle, Clock,
  ArrowRight, Trash2, Pencil,
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

function BecomeAMentorContent() {
  const { user, refreshUser } = useAuth();
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

    if (!linkedinUrl.trim()) {
      toast.error('LinkedIn profile URL is required');
      return;
    }

    setLoading(true);

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

      toast.success(editing ? 'Application updated' : 'Application submitted');
      setApprovalStatus('pending');
      setSubmittedProfile({ ...payload, approvalStatus: 'pending' });
      setEditing(false);
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

      toast.success('Application withdrawn');
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

      refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const startReapply = () => {
    setEditing(true);
    if (submittedProfile) populateForm(submittedProfile);
  };

  if (fetching) {
    return (
      <DashboardLayout userName="Become a Mentor">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  const showForm = approvalStatus === 'none' || editing;

  return (
    <DashboardLayout userName="Become a Mentor">
      <div className="max-w-2xl mx-auto pb-20">

        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Become a mentor
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Guide students, host 1-on-1 sessions, and share what you know. Applications are
            reviewed within 24–48 hours.
          </p>
        </div>

        {/* ── APPROVED ── */}
        {approvalStatus === 'approved' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">You&apos;re approved</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Your mentor profile is live. Students can now find you and book sessions.
            </p>
            <a
              href="/mentor/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Go to mentor dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* ── PENDING ── */}
        {approvalStatus === 'pending' && !editing && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 w-5 h-5 shrink-0 text-amber-500" />
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Under review</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      We&apos;re verifying your credentials. You&apos;ll get an email once it&apos;s done.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  {withdrawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Withdraw
                </button>
              </div>
            </div>

            {submittedProfile && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Submitted details
                </h3>
                <dl className="divide-y divide-slate-100 text-sm">
                  <Row label="LinkedIn">
                    <a href={submittedProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline break-all">
                      {submittedProfile.linkedinUrl}
                    </a>
                  </Row>
                  <Row label="Title">{submittedProfile.currentTitle || '—'}</Row>
                  <Row label="Company">{submittedProfile.currentCompany || '—'}</Row>
                  <Row label="Experience">{submittedProfile.experienceYears ? `${submittedProfile.experienceYears} years` : '—'}</Row>
                  <Row label="Location">{submittedProfile.location || '—'}</Row>
                  <Row label="Education">{submittedProfile.education || '—'}</Row>
                  {submittedProfile.expertise && submittedProfile.expertise.length > 0 && (
                    <Row label="Expertise">
                      <div className="flex flex-wrap gap-1.5">
                        {submittedProfile.expertise.map((exp) => (
                          <span key={exp} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{exp}</span>
                        ))}
                      </div>
                    </Row>
                  )}
                  {submittedProfile.bio && <Row label="Bio">{submittedProfile.bio}</Row>}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* ── REJECTED ── */}
        {approvalStatus === 'rejected' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 w-5 h-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900">Application not approved</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Thanks for applying. Your application wasn&apos;t approved this time.
                </p>
                {submittedProfile?.rejectionReason && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Feedback</p>
                    <p className="mt-1 text-sm text-red-800">{submittedProfile.rejectionReason}</p>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={startReapply}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Re-apply
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FORM ── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Field label="LinkedIn URL" required>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className={inputClass}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <Field label="Current title">
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Software Architect"
                  className={inputClass}
                />
              </Field>
              <Field label="Company">
                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className={inputClass}
                />
              </Field>
              <Field label="Years of experience">
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 5"
                  className={inputClass}
                />
              </Field>
              <Field label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Education">
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech, IIT Bombay"
                className={inputClass}
              />
            </Field>

            <Field label="Skills & expertise" hint="Separate multiple skills with commas">
              <input
                type="text"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="System Design, Product Management, React"
                className={inputClass}
              />
            </Field>

            <Field label="Short bio" hint="Tell students about your background and how you can help">
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief overview of your experience and mentorship approach..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</>
                ) : editing ? 'Save changes' : 'Submit application'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (submittedProfile) populateForm(submittedProfile);
                  }}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="col-span-2 text-slate-700">{children}</dd>
    </div>
  );
}

export default function BecomeAMentorPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <BecomeAMentorContent />
    </ProtectedRoute>
  );
}
