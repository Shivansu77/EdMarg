'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import { apiClient } from '@/utils/api-client';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  MessageSquare,
  Settings2,
  Star,
} from 'lucide-react';

interface MentorSettings {
  pricePerSession: number;
  sessionDuration: number;
  autoConfirm: boolean;
  sessionNotes: string;
  totalSessions: number;
  rating: number;
}

const DEFAULT_SETTINGS: MentorSettings = {
  pricePerSession: 0,
  sessionDuration: 45,
  autoConfirm: true,
  sessionNotes: '',
  totalSessions: 0,
  rating: 0,
};

function MentorSettingsContent() {
  const [settings, setSettings] = useState<MentorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<MentorSettings>('/api/mentor/settings');
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Unable to load mentor settings');
        }

        setSettings(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load mentor settings');
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

      const response = await apiClient.put('/api/mentor/profile', {
        pricePerSession: Number(settings.pricePerSession),
        sessionDuration: Number(settings.sessionDuration),
        autoConfirm: settings.autoConfirm,
        sessionNotes: settings.sessionNotes.trim(),
      });

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save mentor settings');
      }

      setSuccess('Settings updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save mentor settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MentorDashboardLayout>
    );
  }

  return (
    <MentorDashboardLayout>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
              Mentor Settings
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Configure how students book and experience your sessions.
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              These defaults shape pricing, session length, review flow, and the context students receive before a call starts.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mentor/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Open full profile
            </Link>
            <Link
              href="/mentor/results"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              View results
              <ArrowRight size={16} />
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <p>{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block rounded-2xl border border-gray-200 p-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Price per session
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.pricePerSession}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      pricePerSession: Number(event.target.value),
                    }))
                  }
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                />
              </label>

              <label className="block rounded-2xl border border-gray-200 p-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Clock3 className="h-4 w-4 text-gray-500" />
                  Session duration
                </span>
                <select
                  value={settings.sessionDuration}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      sessionDuration: Number(event.target.value),
                    }))
                  }
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                >
                  {[15, 30, 45, 60, 90, 120, 180].map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} minutes
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Settings2 className="h-4 w-4 text-gray-500" />
                    Booking confirmation mode
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose whether new sessions are confirmed automatically or stay in your review queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      autoConfirm: !current.autoConfirm,
                    }))
                  }
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    settings.autoConfirm ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                  aria-pressed={settings.autoConfirm}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.autoConfirm ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <label className="block rounded-2xl border border-gray-200 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                Default session note
              </span>
              <textarea
                rows={5}
                value={settings.sessionNotes}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    sessionNotes: event.target.value,
                  }))
                }
                placeholder="Add a reusable note students should know before booking."
                className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save settings
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Current snapshot</h2>
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Rating</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Star className="h-5 w-5 text-amber-500" />
                  {settings.rating > 0 ? settings.rating.toFixed(1) : 'New'}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total sessions</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{settings.totalSessions}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirmation mode</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {settings.autoConfirm ? 'Students are confirmed automatically.' : 'Each booking waits for your approval.'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Why this matters</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li>Pricing and session length directly affect which students book and how often they return.</li>
              <li>Auto-confirmation speeds up conversion, while manual review gives you tighter control over your calendar.</li>
              <li>Default notes reduce repetitive questions and help students arrive prepared.</li>
            </ul>
          </section>
        </aside>
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
