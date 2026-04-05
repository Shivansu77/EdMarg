'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Save, CalendarDays, AlertCircle, Clock3, CheckCircle2 } from 'lucide-react';

interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  startHour: number;
  endHour: number;
}

interface BackendSchedule {
  dayOfWeek: number;
  slots: { startTime: string; endTime: string }[];
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`,
}));

function MentorScheduleContent() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.id,
      isAvailable: false,
      startHour: 9,
      endHour: 17,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await apiClient.get<BackendSchedule[]>('/api/v1/mentor/availability');
        if (res.success && res.data) {
          // Map backend data to our state
          const newSchedules = [...schedules];
          res.data.forEach((backendSched: BackendSchedule) => {
            const index = newSchedules.findIndex((s) => s.dayOfWeek === backendSched.dayOfWeek);
            if (index !== -1 && backendSched.slots && backendSched.slots.length > 0) {
              const startHrStr = backendSched.slots[0].startTime.split(':')[0];
              const endHrStr = backendSched.slots[backendSched.slots.length - 1].endTime.split(':')[0];
              
              newSchedules[index] = {
                dayOfWeek: backendSched.dayOfWeek,
                isAvailable: true,
                startHour: parseInt(startHrStr, 10),
                endHour: parseInt(endHrStr, 10),
              };
            }
          });
          setSchedules(newSchedules);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].isAvailable = !newSchedules[dayIndex].isAvailable;
    setSchedules(newSchedules);
  };

  const handleChangeTime = (dayIndex: number, field: 'startHour' | 'endHour', value: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex][field] = value;
    setSchedules(newSchedules);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      // Only send available days to the backend
      const payload = schedules
        .filter((s) => s.isAvailable)
        .map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startHour: s.startHour,
          endHour: s.endHour,
        }));

      // Validation
      for (const s of payload) {
        if (s.startHour >= s.endHour) {
          throw new Error('Start time must be before end time.');
        }
      }

      const res = await apiClient.put('/api/v1/mentor/availability', { schedules: payload });

      if (res.success) {
        setSuccessMsg('Schedule updated successfully! Your slots have been automatically generated based on your session duration.');
      } else {
        throw new Error(res.message || 'Failed to update schedule');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-[radial-gradient(circle_at_top,#f4f4f5_0%,#fafafa_40%,#ffffff_100%)]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Loading your schedule...</p>
          </div>
        </div>
      </MentorDashboardLayout>
    );
  }

  const availableDays = schedules.filter((s) => s.isAvailable).length;
  const weeklyHours = schedules
    .filter((s) => s.isAvailable)
    .reduce((sum, s) => sum + Math.max(0, s.endHour - s.startHour), 0);

  return (
    <MentorDashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f4f5_0%,#fafafa_35%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Mentor Availability</p>
                <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-zinc-900">
                  <CalendarDays className="h-8 w-8 text-zinc-700" />
                  Manage Schedule
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  Set your weekly working hours and we&apos;ll automatically generate bookable slots based on your configured session duration.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Available Days</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{availableDays} / 7</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Weekly Hours</p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">{weeklyHours}h</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p>{successMsg}</p>
                </div>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_60px_-45px_rgba(0,0,0,0.5)]">
            <div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4">
              <p className="text-sm font-medium text-zinc-700">Weekly Time Blocks</p>
            </div>

            <div className="divide-y divide-zinc-100">
              {schedules.map((schedule, index) => {
                const dayName = DAYS_OF_WEEK.find((d) => d.id === schedule.dayOfWeek)?.name;

                return (
                  <div
                    key={schedule.dayOfWeek}
                    className={`px-6 py-5 transition-colors ${schedule.isAvailable ? 'bg-white' : 'bg-zinc-50/60'}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleDay(index)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2 ${
                            schedule.isAvailable ? 'bg-zinc-900' : 'bg-zinc-300'
                          }`}
                          role="switch"
                          aria-checked={schedule.isAvailable}
                        >
                          <span className="sr-only">Toggle availability</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                              schedule.isAvailable ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{dayName}</p>
                          <p className="text-xs text-zinc-500">{schedule.isAvailable ? 'Open for bookings' : 'Not available'}</p>
                        </div>
                      </div>

                      {schedule.isAvailable ? (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                            <label className="sr-only">Start time</label>
                            <select
                              value={schedule.startHour}
                              onChange={(e) => handleChangeTime(index, 'startHour', parseInt(e.target.value, 10))}
                              className="min-w-34 border-none bg-transparent text-sm font-medium text-zinc-800 outline-none"
                            >
                              {HOURS.map((h) => (
                                <option key={h.value} value={h.value}>
                                  {h.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            to
                          </div>

                          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
                            <label className="sr-only">End time</label>
                            <select
                              value={schedule.endHour}
                              onChange={(e) => handleChangeTime(index, 'endHour', parseInt(e.target.value, 10))}
                              className="min-w-34 border-none bg-transparent text-sm font-medium text-zinc-800 outline-none"
                            >
                              {HOURS.map((h) => (
                                <option key={h.value} value={h.value} disabled={h.value <= schedule.startHour}>
                                  {h.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorSchedulePage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorScheduleContent />
    </ProtectedRoute>
  );
}
