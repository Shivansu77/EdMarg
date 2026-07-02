'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  MessageSquare,
  Settings2,
  Star,
  Bell,
  Calendar,
  CreditCard,
  Trash2,
  Globe,
  Mail,
  Smartphone,
  Megaphone,
} from 'lucide-react';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

interface MentorSettings {
  timezone: string;
  notificationPreferences: NotificationPreferences;
  pricePerSession: number;
  sessionDuration: number;
  autoConfirm: boolean;
  sessionNotes: string;
  totalSessions: number;
  rating: number;
}

const DEFAULT_SETTINGS: MentorSettings = {
  timezone: 'Asia/Kolkata',
  notificationPreferences: { email: true, sms: false, marketing: false },
  pricePerSession: 0,
  sessionDuration: 45,
  autoConfirm: false,
  sessionNotes: '',
  totalSessions: 0,
  rating: 0,
};

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

function MentorSettingsContent() {
  const [settings, setSettings] = useState<MentorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock states for integrations
  const [calendarConnected, setCalendarConnected] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<any>('/api/v1/users/me');
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Unable to load settings');
        }

        const userData = response.data;
        const mp = userData.mentorProfile || {};
        const prefs = userData.notificationPreferences || {};

        setSettings({
          timezone: userData.timezone || 'Asia/Kolkata',
          notificationPreferences: {
            email: prefs.email ?? true,
            sms: prefs.sms ?? false,
            marketing: prefs.marketing ?? false,
          },
          pricePerSession: mp.pricePerSession ?? 0,
          sessionDuration: mp.sessionDuration || 45,
          autoConfirm: mp.autoConfirm ?? false,
          sessionNotes: mp.sessionNotes || '',
          totalSessions: mp.totalSessions || 0,
          rating: mp.rating || 0,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load settings');
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Save to full user profile to handle timezone & notifications
      const payload = {
        timezone: settings.timezone,
        notificationPreferences: settings.notificationPreferences,
        mentorProfile: {
          pricePerSession: Number(settings.pricePerSession),
          sessionDuration: Number(settings.sessionDuration),
          autoConfirm: settings.autoConfirm,
          sessionNotes: settings.sessionNotes.trim(),
        }
      };

      const response = await apiClient.put('/api/v1/users/profile', payload);

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save settings');
      }

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

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="max-w-6xl pb-16 relative">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Platform Configuration
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
                Mentor Settings
              </h1>
              <p className="mt-3 text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Configure your availability, notifications, integrations, and how students book sessions.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/mentor/profile"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white hover:shadow-sm"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm p-4 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <p className="text-sm font-bold text-red-900">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-200/50 bg-emerald-50/80 backdrop-blur-sm p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <p className="text-sm font-bold text-emerald-900">{success}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Account Settings */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Account Preferences</h2>
                <p className="text-sm text-slate-600 font-medium">Localization and global settings</p>
              </div>
            </div>
            
            <div className="max-w-md space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Timezone</label>
              <div className="relative">
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                  className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-300" />
                </div>
              </div>
              <p className="text-xs text-slate-500 ml-1">All your bookings will be displayed in this timezone.</p>
            </div>
          </section>

          {/* Session & Rates */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Session & Rates</h2>
                <p className="text-sm text-slate-600 font-medium">How students book and pay you</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Price Per Session (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.pricePerSession}
                      onChange={(e) => setSettings(s => ({ ...s, pricePerSession: Number(e.target.value) }))}
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Session Duration</label>
                  <div className="relative">
                    <Clock3 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                    <select
                      value={settings.sessionDuration}
                      onChange={(e) => setSettings(s => ({ ...s, sessionDuration: Number(e.target.value) }))}
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      {[15, 30, 45, 60, 90, 120].map((duration) => (
                        <option key={duration} value={duration}>{duration} minutes</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 ring-1 ring-emerald-500/5">
                <div className="max-w-lg">
                  <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Auto-Confirm Bookings</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Automatically accept all session requests without manual approval. Recommended for high-volume mentors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, autoConfirm: !s.autoConfirm }))}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-inner shrink-0 ${
                    settings.autoConfirm ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                      settings.autoConfirm ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Default Session Note</label>
                <textarea
                  rows={4}
                  value={settings.sessionNotes}
                  onChange={(e) => setSettings(s => ({ ...s, sessionNotes: e.target.value }))}
                  placeholder="Add a reusable note students should know before booking."
                  className="w-full p-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm resize-none leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-6">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Notifications</h2>
                <p className="text-sm text-slate-600 font-medium">Manage how we contact you</p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive booking confirmations and messages via email', icon: Mail },
                { key: 'sms', label: 'SMS Alerts', desc: 'Get text messages for upcoming session reminders', icon: Smartphone },
                { key: 'marketing', label: 'Platform Updates', desc: 'Tips, features, and platform news', icon: Megaphone },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/60 border border-white hover:border-emerald-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle(key as keyof NotificationPreferences)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                      settings.notificationPreferences[key as keyof NotificationPreferences] ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                        settings.notificationPreferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Integrations (Mock SaaS UI) */}
          <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Integrations</h2>
                <p className="text-sm text-slate-600 font-medium">Connect external services</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-[2rem] bg-white/60 border border-white shadow-sm flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-6 w-6 text-blue-500" />
                    <h3 className="font-bold text-slate-900">Google Calendar</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Sync your bookings automatically and prevent double-booking.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${calendarConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {calendarConnected ? 'Connected' : 'Not Connected'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarConnected(!calendarConnected)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      calendarConnected ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {calendarConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-white/60 border border-white shadow-sm flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="h-6 w-6 text-indigo-500" />
                    <h3 className="font-bold text-slate-900">Stripe Payouts</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Receive payouts directly to your bank account after completed sessions.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${stripeConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {stripeConnected ? 'Active' : 'Pending Setup'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStripeConnected(!stripeConnected)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      stripeConnected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    {stripeConnected ? 'Manage' : 'Setup Payouts'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-[3rem] border border-red-100 bg-red-50/50 backdrop-blur-3xl p-8 sm:p-10 shadow-sm ring-1 ring-red-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-extrabold text-red-900 tracking-tight">Danger Zone</h2>
                <p className="mt-2 text-sm text-red-700/80 font-medium max-w-md">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-red-200 text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors hover:border-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </section>

          {/* Submit Action */}
          <div className="sticky bottom-8 z-10 flex flex-col sm:flex-row items-center justify-end gap-6 rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-3xl ring-1 ring-black/[0.03]">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-10 text-base font-bold text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              Save Configuration
            </button>
          </div>

        </form>
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
