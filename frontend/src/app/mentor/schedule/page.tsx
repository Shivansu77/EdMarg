'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Save, CalendarDays, AlertCircle } from 'lucide-react';

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
        const res = await apiClient.get<BackendSchedule[]>('/api/mentor/availability');
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

      const res = await apiClient.put('/api/mentor/availability', { schedules: payload });

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
      <DashboardLayout userName="Schedule">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={user?.name || "Schedule"}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-8 h-8 text-indigo-600" />
              Manage Schedule
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Define your weekly working hours. We&apos;ll automatically turn these into bookable slots based on your set session duration.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start">
            <div className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-emerald-500 text-xs font-bold">✓</div>
            <p className="text-sm text-emerald-800">{successMsg}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {schedules.map((schedule, index) => {
              const dayName = DAYS_OF_WEEK.find((d) => d.id === schedule.dayOfWeek)?.name;
              
              return (
                <div key={schedule.dayOfWeek} className={`p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${schedule.isAvailable ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* Toggle */}
                  <div className="w-40 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(index)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                        schedule.isAvailable ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={schedule.isAvailable}
                    >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          schedule.isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`font-medium ${schedule.isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                      {dayName}
                    </span>
                  </div>

                  {/* Time Inputs */}
                  <div className="flex-1">
                    {schedule.isAvailable ? (
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="sr-only">Start time</label>
                          <select
                            value={schedule.startHour}
                            onChange={(e) => handleChangeTime(index, 'startHour', parseInt(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                          >
                            {HOURS.map((h) => (
                              <option key={h.value} value={h.value}>
                                {h.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-gray-400 font-medium">to</span>
                        <div className="flex items-center gap-2">
                          <label className="sr-only">End time</label>
                          <select
                            value={schedule.endHour}
                            onChange={(e) => handleChangeTime(index, 'endHour', parseInt(e.target.value))}
                            className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
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
                      <span className="text-sm text-gray-400 italic">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MentorSchedulePage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorScheduleContent />
    </ProtectedRoute>
  );
}
