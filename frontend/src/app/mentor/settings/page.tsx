'use client';

import React, { useEffect, useState } from 'react';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import ProfileImageUpload from '@/components/common/ProfileImageUpload';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import {
  UserCircle,
  Mail,
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Building2,
  MapPin,
  Settings2,
  IndianRupee,
  Bell,
  Smartphone,
  Megaphone,
  Calendar,
  CreditCard,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

const PREDEFINED_EXPERTISE = [
  'Software Engineering', 'Data Science', 'Machine Learning',
  'Product Management', 'Design', 'Marketing', 'Finance',
  'Consulting', 'Entrepreneurship', 'Web Development',
  'Mobile Development', 'Cybersecurity', 'Cloud Computing',
  'DevOps', 'System Design', 'Interview Prep', 'Career Guidance'
];

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
  { id: 'sessions', label: 'Session & Rates', icon: Settings2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Calendar },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

interface MentorSettings {
  name: string;
  profileImage: string;
  bio: string;
  linkedinUrl: string;
  experienceYears: number | '';
  expertise: string[];
  languages: string[];
  currentCompany: string;
  currentTitle: string;
  location: string;
  education: string;

  pricePerSession: number;
  sessionDuration: number;
  autoConfirm: boolean;
  sessionNotes: string;

  timezone: string;
  notificationPreferences: NotificationPreferences;

  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
}

const DEFAULT_SETTINGS: MentorSettings = {
  name: '',
  profileImage: '',
  bio: '',
  linkedinUrl: '',
  experienceYears: '',
  expertise: [],
  languages: ['English'],
  currentCompany: '',
  currentTitle: '',
  location: '',
  education: '',

  pricePerSession: 0,
  sessionDuration: 45,
  autoConfirm: false,
  sessionNotes: '',

  timezone: 'Asia/Kolkata',
  notificationPreferences: { email: true, sms: false, marketing: false },

  approvalStatus: 'pending',
  rejectionReason: '',
};

const inputClass =
  'w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors';
const inputWithIconClass =
  'w-full h-11 pl-9 pr-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

function MentorSettingsContent() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  const [settings, setSettings] = useState<MentorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [calendarConnected, setCalendarConnected] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (TABS.some(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<any>('/api/v1/users/me', {
          headers: {
            'x-bypass-cache': '1',
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Unable to load settings');
        }

        const userData = response.data;
        const mp = userData.mentorProfile || {};
        const prefs = userData.notificationPreferences || {};

        setSettings({
          name: userData.name || '',
          profileImage: userData.profileImage || '',
          bio: mp.bio || '',
          linkedinUrl: mp.linkedinUrl || '',
          experienceYears: mp.experienceYears || '',
          expertise: mp.expertise || [],
          languages: mp.languages?.length ? mp.languages : ['English'],
          currentCompany: mp.currentCompany || '',
          currentTitle: mp.currentTitle || '',
          location: mp.location || '',
          education: mp.education || '',

          pricePerSession: mp.pricePerSession ?? 0,
          sessionDuration: mp.sessionDuration || 45,
          autoConfirm: mp.autoConfirm ?? false,
          sessionNotes: mp.sessionNotes || '',

          timezone: userData.timezone || 'Asia/Kolkata',
          notificationPreferences: {
            email: prefs.email ?? true,
            sms: prefs.sms ?? false,
            marketing: prefs.marketing ?? false,
          },

          approvalStatus: mp.approvalStatus || 'pending',
          rejectionReason: mp.rejectionReason || '',
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load settings');
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleSave = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name: settings.name.trim(),
        profileImage: settings.profileImage,
        linkedinUrl: settings.linkedinUrl,
        bio: settings.bio,
        experienceYears: settings.experienceYears === '' ? 0 : Number(settings.experienceYears),
        expertise: settings.expertise,
        languages: settings.languages,
        currentCompany: settings.currentCompany,
        currentTitle: settings.currentTitle,
        location: settings.location,
        education: settings.education,

        timezone: settings.timezone,
        notificationPreferences: settings.notificationPreferences,
        pricePerSession: Number(settings.pricePerSession),
        sessionDuration: Number(settings.sessionDuration),
        autoConfirm: settings.autoConfirm,
        sessionNotes: settings.sessionNotes.trim(),
      };

      const response = await apiClient.put<any>('/api/v1/users/profile', payload);

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save settings');
      }

      updateUser({
        name: settings.name.trim(),
        profileImage: settings.profileImage,
        profileImageUpdatedAt: Date.now(),
        mentorProfile: response.data?.mentorProfile
      });

      setSuccess('Settings updated successfully.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const handleExpertiseToggle = (skill: string) => {
    setSettings(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(i => i !== skill)
        : [...prev.expertise, skill]
    }));
  };

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </MentorDashboardLayout>
    );
  }

  const statusLabel = settings.approvalStatus.charAt(0).toUpperCase() + settings.approvalStatus.slice(1);

  return (
    <MentorDashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your profile, session rates, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Verification</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              settings.approvalStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-700'
                : settings.approvalStatus === 'rejected'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
            }`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {settings.approvalStatus !== 'approved' && (
          <div className={`mb-6 rounded-lg p-3.5 border flex items-start gap-2.5 ${
            settings.approvalStatus === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <Clock className={`w-4.5 h-4.5 mt-0.5 flex-shrink-0 ${settings.approvalStatus === 'rejected' ? 'text-red-500' : 'text-amber-500'}`} />
            <div>
              <p className={`text-sm font-medium ${settings.approvalStatus === 'rejected' ? 'text-red-800' : 'text-amber-800'}`}>
                {settings.approvalStatus === 'rejected'
                  ? 'Your mentor account is currently rejected.'
                  : 'Your mentor profile is under admin review.'}
              </p>
              <p className={`text-sm mt-0.5 ${settings.approvalStatus === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>
                You can update this profile now. Full dashboard access unlocks after approval.
              </p>
              {settings.approvalStatus === 'rejected' && settings.rejectionReason && (
                <p className="text-sm mt-1.5 text-red-700"><span className="font-medium">Reason:</span> {settings.rejectionReason}</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-emerald-500 mt-0.5" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Tabs */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === 'danger';
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2.5 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? isDanger
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-900'
                        : isDanger
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSave} className="space-y-6">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <>
                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Your public identity on the platform.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Full Name</label>
                          <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
                            required
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full h-11 pl-9 pr-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Profile Picture</label>
                        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5">
                          <ProfileImageUpload
                            currentImage={settings.profileImage}
                            userName={settings.name}
                            onUploadSuccess={(url) => setSettings(s => ({ ...s, profileImage: url }))}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Professional Details</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Your experience and background.</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>LinkedIn Profile</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="url"
                            value={settings.linkedinUrl}
                            onChange={(e) => setSettings(s => ({ ...s, linkedinUrl: e.target.value }))}
                            placeholder="https://www.linkedin.com/in/your-profile"
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Bio / About Me</label>
                        <textarea
                          rows={4}
                          value={settings.bio}
                          onChange={(e) => setSettings(s => ({ ...s, bio: e.target.value }))}
                          placeholder="Tell students about your journey, what you do, and how you can help them…"
                          className="w-full p-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      <div className="max-w-xs">
                        <label className={labelClass}>Years of Experience</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            value={settings.experienceYears}
                            onChange={(e) => setSettings(s => ({ ...s, experienceYears: e.target.value ? Number(e.target.value) : '' }))}
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Work & Education</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Where you are right now.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Current Company</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={settings.currentCompany}
                            onChange={(e) => setSettings(s => ({ ...s, currentCompany: e.target.value }))}
                            placeholder="e.g. Google, Microsoft, Startup"
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Current Title</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={settings.currentTitle}
                            onChange={(e) => setSettings(s => ({ ...s, currentTitle: e.target.value }))}
                            placeholder="e.g. Senior Software Engineer"
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={settings.location}
                            onChange={(e) => setSettings(s => ({ ...s, location: e.target.value }))}
                            placeholder="e.g. San Francisco, CA"
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Education</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={settings.education}
                            onChange={(e) => setSettings(s => ({ ...s, education: e.target.value }))}
                            placeholder="e.g. BS Computer Science, MIT"
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Areas of Expertise</h2>
                      <p className="text-sm text-slate-500 mt-0.5">What you can mentor on.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_EXPERTISE.map(skill => {
                        const isSelected = settings.expertise.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleExpertiseToggle(skill)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* ACCOUNT & SECURITY TAB */}
              {activeTab === 'account' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Account & Security</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage passwords, 2FA, and connected accounts.</p>
                  </div>
                  <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
                    <ClerkUserProfile
                      routing="hash"
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          cardBox: "w-full shadow-none",
                          card: "w-full shadow-none"
                        }
                      }}
                    />
                  </div>
                </section>
              )}

              {/* SESSIONS & RATES TAB */}
              {activeTab === 'sessions' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Session & Rates</h2>
                    <p className="text-sm text-slate-500 mt-0.5">How students book and pay you.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>Price Per Session (INR)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={settings.pricePerSession}
                            onChange={(e) => setSettings(s => ({ ...s, pricePerSession: Number(e.target.value) }))}
                            className={inputWithIconClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Session Duration</label>
                        <select
                          value={settings.sessionDuration}
                          onChange={(e) => setSettings(s => ({ ...s, sessionDuration: Number(e.target.value) }))}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          {[15, 30, 45, 60, 90, 120].map((duration) => (
                            <option key={duration} value={duration}>{duration} minutes</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                      <div className="max-w-lg pr-4">
                        <h4 className="text-sm font-medium text-slate-900">Auto-Confirm Bookings</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          Automatically accept all session requests without manual approval. Recommended for high-volume mentors.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, autoConfirm: !s.autoConfirm }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          settings.autoConfirm ? 'bg-slate-900' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.autoConfirm ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className={labelClass}>Default Session Note</label>
                      <textarea
                        rows={4}
                        value={settings.sessionNotes}
                        onChange={(e) => setSettings(s => ({ ...s, sessionNotes: e.target.value }))}
                        placeholder="Add a reusable note students should know before booking."
                        className="w-full p-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage how we contact you.</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Booking confirmations and messages via email', icon: Mail },
                      { key: 'sms', label: 'SMS Alerts', desc: 'Text reminders for upcoming sessions', icon: Smartphone },
                      { key: 'marketing', label: 'Platform Updates', desc: 'Tips, features, and platform news', icon: Megaphone },
                    ].map(({ key, label, desc, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900">{label}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationToggle(key as keyof NotificationPreferences)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notificationPreferences[key as keyof NotificationPreferences] ? 'bg-slate-900' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.notificationPreferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Account Preferences</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Localization and global settings.</p>
                  </div>

                  <div className="max-w-sm">
                    <label className={labelClass}>Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-400">All your bookings display in this timezone.</p>
                  </div>
                </section>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Integrations</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Connect external services.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-5 rounded-lg border border-slate-200 flex flex-col justify-between min-h-[170px]">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <Calendar className="h-5 w-5 text-slate-700" />
                          <h3 className="text-sm font-medium text-slate-900">Google Calendar</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Sync your bookings automatically and prevent double-booking.
                        </p>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <span className={`text-xs font-medium ${calendarConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {calendarConnected ? 'Connected' : 'Not connected'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalendarConnected(!calendarConnected)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            calendarConnected ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {calendarConnected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>

                    <div className="p-5 rounded-lg border border-slate-200 flex flex-col justify-between min-h-[170px]">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <CreditCard className="h-5 w-5 text-slate-700" />
                          <h3 className="text-sm font-medium text-slate-900">Stripe Payouts</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Receive payouts directly to your bank account after completed sessions.
                        </p>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <span className={`text-xs font-medium ${stripeConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {stripeConnected ? 'Active' : 'Pending setup'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setStripeConnected(!stripeConnected)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            stripeConnected ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {stripeConnected ? 'Manage' : 'Setup payouts'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === 'danger' && (
                <section className="rounded-xl border border-red-200 bg-white p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-red-700">Delete Account</h2>
                      <p className="mt-1 text-sm text-slate-500 max-w-md">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
                </section>
              )}

              {/* Submit Action */}
              {activeTab !== 'account' && activeTab !== 'danger' && activeTab !== 'integrations' && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save changes
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorSettingsPage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorSettingsContent />
    </ProtectedRoute>
  );
}
