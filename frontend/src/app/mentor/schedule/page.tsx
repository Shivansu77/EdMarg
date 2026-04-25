/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Save,
  CalendarDays,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';

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
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`,
}));

const isWeekend = (dayId: number) => dayId === 0 || dayId === 6;

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
          const newSchedules = [...schedules];
          res.data.forEach((backendSched: BackendSchedule) => {
            const index = newSchedules.findIndex((s) => s.dayOfWeek === backendSched.dayOfWeek);
            if (index !== -1 && backendSched.slots && backendSched.slots.length > 0) {
              const startHrStr = backendSched.slots[0].startTime.split(':')[0];
              const endHrStr =
                backendSched.slots[backendSched.slots.length - 1].endTime.split(':')[0];
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
     
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].isAvailable = !newSchedules[dayIndex].isAvailable;
    setSchedules(newSchedules);
  };

  const handleChangeTime = (
    dayIndex: number,
    field: 'startHour' | 'endHour',
    value: number
  ) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex][field] = value;
    setSchedules(newSchedules);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = schedules
        .filter((s) => s.isAvailable)
        .map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startHour: s.startHour,
          endHour: s.endHour,
        }));

      for (const s of payload) {
        if (s.startHour >= s.endHour) {
          throw new Error('Start time must be before end time.');
        }
      }

      const res = await apiClient.put('/api/v1/mentor/availability', { schedules: payload });

      if (res.success) {
        setSuccessMsg(
          'Schedule updated successfully! Your slots have been automatically generated based on your session duration.'
        );
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">Loading your schedule...</p>
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
      <div className="min-h-screen pb-24 space-y-6">

        {/* Page title */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1">
            Mentor Workspace
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-500/20">
                  <CalendarDays className="h-5 w-5 text-white" />
                </span>
                Manage Schedule
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Set your weekly working hours and we&apos;ll automatically generate bookable slots
                based on your configured session duration.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 whitespace-nowrap self-start sm:self-auto"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-center gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Available Days
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-900">
                {availableDays}
                <span className="text-sm font-semibold text-slate-400 ml-1">/ 7</span>
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(16,185,129,0.03)] flex items-center gap-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Weekly Hours
              </p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-900">
                {weeklyHours}
                <span className="text-sm font-semibold text-slate-400 ml-1">hrs</span>
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Schedule table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
          {/* Table header */}
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Weekly Time Blocks</p>
            <p className="text-xs text-slate-400 font-medium">Toggle each day to enable or disable</p>
          </div>

          <div className="divide-y divide-slate-100">
            {schedules.map((schedule, index) => {
              const day = DAYS_OF_WEEK.find((d) => d.id === schedule.dayOfWeek);
              const weekend = isWeekend(schedule.dayOfWeek);

              return (
                <div
                  key={schedule.dayOfWeek}
                  className={`px-6 py-5 transition-colors ${
                    schedule.isAvailable
                      ? 'bg-white'
                      : weekend
                      ? 'bg-slate-50/40'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Day toggle */}
                    <div className="flex items-center gap-4 min-w-[170px]">
                      {/* Toggle switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleDay(index)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                          schedule.isAvailable ? 'bg-gradient-to-br from-emerald-400 to-green-500' : 'bg-slate-200'
                        }`}
                        role="switch"
                        aria-checked={schedule.isAvailable}
                      >
                        <span className="sr-only">Toggle availability</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            schedule.isAvailable ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div className="flex items-center gap-2.5">
                        {weekend ? (
                          <Moon size={14} className="text-slate-400 shrink-0" />
                        ) : (
                          <Sun size={14} className={schedule.isAvailable ? 'text-emerald-500 shrink-0' : 'text-slate-300 shrink-0'} />
                        )}
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              schedule.isAvailable ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {day?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {schedule.isAvailable ? 'Open for bookings' : 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time selectors */}
                    {schedule.isAvailable ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Start time */}
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:border-emerald-300 transition-colors">
                          <label className="sr-only">Start time</label>
                          <select
                            value={schedule.startHour}
                            onChange={(e) =>
                              handleChangeTime(index, 'startHour', parseInt(e.target.value, 10))
                            }
                            className="min-w-32 border-none bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                          >
                            {HOURS.map((h) => (
                              <option key={h.value} value={h.value}>
                                {h.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-emerald-500" />
                          to
                        </div>

                        {/* End time */}
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:border-emerald-300 transition-colors">
                          <label className="sr-only">End time</label>
                          <select
                            value={schedule.endHour}
                            onChange={(e) =>
                              handleChangeTime(index, 'endHour', parseInt(e.target.value, 10))
                            }
                            className="min-w-32 border-none bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                          >
                            {HOURS.map((h) => (
                              <option
                                key={h.value}
                                value={h.value}
                                disabled={h.value <= schedule.startHour}
                              >
                                {h.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Duration pill */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          {Math.max(0, schedule.endHour - schedule.startHour)}h available
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <p className="text-xs text-slate-500 font-medium">
              💡 Slots are auto-generated every hour within your set windows. Students can book any available slot.
            </p>
          </div>
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
