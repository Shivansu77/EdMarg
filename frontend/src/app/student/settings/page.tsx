'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import ProfileImageUpload from '@/components/common/ProfileImageUpload';
import { useAuth } from '@/context/AuthContext';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
  Trash2,
  Mail,
  Smartphone,
  Megaphone,
  Eye,
  EyeOff,
  Settings,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';

const CLASS_LEVELS = [
  'High School',
  'Undergraduate / College',
  'Graduate / Masters',
  'Professional / Corporate',
  'Other'
];

const PREDEFINED_INTERESTS = [
  'Software Engineering', 'Data Science', 'Machine Learning',
  'Product Management', 'Design', 'Marketing', 'Finance',
  'Consulting', 'Entrepreneurship', 'Web Development',
  'Mobile Development', 'Cybersecurity', 'Cloud Computing'
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

const NAME_MAX_LENGTH = 80;

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

interface StudentSettings {
  timezone: string;
  notificationPreferences: NotificationPreferences;
  profileVisibility: 'public' | 'private';
  name: string;
  profileImage: string;
  classLevel: string;
  interests: string[];
}

const DEFAULT_SETTINGS: StudentSettings = {
  timezone: 'Asia/Kolkata',
  notificationPreferences: { email: true, sms: false, marketing: false },
  profileVisibility: 'public',
  name: '',
  profileImage: '',
  classLevel: '',
  interests: [],
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

const inputClass =
  'w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

function StudentSettingsContent() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [settings, setSettings] = useState<StudentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get<any>('/api/v1/users/me');
      if (!response.success || !response.data) {
        throw new Error(response.error || response.message || 'Unable to load settings');
      }

      const userData = response.data;
      const prefs = userData.notificationPreferences || {};

      setSettings({
        timezone: userData.timezone || 'Asia/Kolkata',
        notificationPreferences: {
          email: prefs.email ?? true,
          sms: prefs.sms ?? false,
          marketing: prefs.marketing ?? false,
        },
        profileVisibility: userData.profileVisibility || 'public',
        name: userData.name || '',
        profileImage: userData.profileImage || '',
        classLevel: userData.studentProfile?.classLevel || '',
        interests: userData.studentProfile?.interests || [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const trimmedName = settings.name.trim();

      if (!trimmedName) {
        throw new Error('Name is required.');
      }

      if (activeTab === 'profile') {
        if (!settings.classLevel) {
          throw new Error('Please select your class level.');
        }
        if (settings.interests.length === 0) {
          throw new Error('Please add at least one interest.');
        }
      }

      const payload = {
        timezone: settings.timezone,
        notificationPreferences: settings.notificationPreferences,
        profileVisibility: settings.profileVisibility,
        name: trimmedName,
        profileImage: settings.profileImage,
        classLevel: settings.classLevel,
        interests: settings.interests,
      };

      const response = await apiClient.put('/api/v1/users/profile', payload);

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save settings');
      }

      updateUser({ name: trimmedName, profileImage: settings.profileImage, profileImageUpdatedAt: Date.now() });

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

  const handleInterestToggle = (interest: string) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (loading) {
    return (
      <DashboardLayout userName="Settings">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  const completedFields = [
    Boolean(settings.name.trim()),
    Boolean(settings.profileImage),
    Boolean(settings.classLevel),
    settings.interests.length > 0,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 4) * 100);

  return (
    <DashboardLayout userName="Settings">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your account, profile, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-all" style={{ width: `${completionPct}%` }} />
            </div>
            <p className="text-sm font-medium text-slate-600 tabular-nums">{completionPct}% complete</p>
          </div>
        </div>

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
                            maxLength={NAME_MAX_LENGTH}
                            required
                            className={inputClass}
                          />
                          <p className="mt-1 text-xs text-slate-400">{settings.name.length}/{NAME_MAX_LENGTH} characters</p>
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
                          <p className="mt-1 text-xs text-slate-400">Email can&apos;t be changed here.</p>
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
                      <h2 className="text-base font-semibold text-slate-900">Academic Background</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Your current education status.</p>
                    </div>

                    <div className="max-w-sm">
                      <label className={labelClass}>Current Class Level</label>
                      <select
                        value={settings.classLevel}
                        onChange={(e) => setSettings(s => ({ ...s, classLevel: e.target.value }))}
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled>Select your education level…</option>
                        {CLASS_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Career Interests</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Select the fields you&apos;d like mentorship in. These help curate your dashboard.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_INTERESTS.map(interest => {
                        const isSelected = settings.interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {interest}
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

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <section className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage how we contact you.</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Booking confirmations and mentor messages via email', icon: Mail },
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
                <>
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
                      <p className="mt-1.5 text-xs text-slate-400">Bookings and schedules display in this timezone.</p>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="mb-6">
                      <h2 className="text-base font-semibold text-slate-900">Privacy</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Control who can see your profile.</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, profileVisibility: 'public' }))}
                        className={`flex flex-col items-start p-4 rounded-lg border text-left transition-colors ${
                          settings.profileVisibility === 'public'
                            ? 'border-slate-900 ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Eye className="w-4 h-4 text-slate-700" />
                          <span className="text-sm font-medium text-slate-900">Public Profile</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Mentors can view your academic background and interests when you request a session.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, profileVisibility: 'private' }))}
                        className={`flex flex-col items-start p-4 rounded-lg border text-left transition-colors ${
                          settings.profileVisibility === 'private'
                            ? 'border-slate-900 ring-1 ring-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <EyeOff className="w-4 h-4 text-slate-700" />
                          <span className="text-sm font-medium text-slate-900">Private Profile</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Mentors only see your name and picture. Background details stay hidden.
                        </p>
                      </button>
                    </div>
                  </section>
                </>
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
              {activeTab !== 'account' && activeTab !== 'danger' && (
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
    </DashboardLayout>
  );
}

export default function StudentSettingsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentSettingsContent />
    </ProtectedRoute>
  );
}
