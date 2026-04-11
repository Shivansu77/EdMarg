'use client';

import { getImageUrl } from '@/utils/imageUrl';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Star,
  Video,
  MessageCircle,
  Lightbulb,
  Check,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { resolveApiBaseUrl } from '@/utils/api-base';

/* ================================================================
   TYPES
   ================================================================ */

type Mentor = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    rating?: number;
  };
};

type Slot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type BookingResult = {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  joinUrl?: string;
  startUrl?: string;
  zoomMeetingId?: string;
  zoomError?: string;
};

/* ================================================================
   CONSTANTS
   ================================================================ */

const API_BASE_URL = resolveApiBaseUrl();

const STEPS = [
  { id: 1, label: 'Mentor', icon: User },
  { id: 2, label: 'Schedule', icon: Calendar },
  { id: 3, label: 'Review', icon: CheckCircle2 },
  { id: 4, label: 'Confirmed', icon: Check },
] as const;

const SESSION_TYPES = [
  { value: 'video', label: '1:1 Video Call', icon: Video },
  { value: 'chat', label: 'Chat Session', icon: MessageCircle },
] as const;

/* ================================================================
   HELPERS
   ================================================================ */

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateDaysForWeek(weekOffset: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + monday + weekOffset * 7);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mentorId = searchParams.get('id');

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loadingMentor, setLoadingMentor] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date & time selection
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Review details
  const [sessionType, setSessionType] = useState('video');
  const [notes, setNotes] = useState('');

  // Booking
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const weekDays = useMemo(() => generateDaysForWeek(weekOffset), [weekOffset]);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  /* -------- Fetch Mentor -------- */
  useEffect(() => {
    if (!mentorId) {
      // No mentor selected — redirect to mentors page so user can pick one
      router.replace('/student/mentors');
      return;
    }

    const fetchMentor = async () => {
      try {
        setLoadingMentor(true);
        const res = await fetch(`${API_BASE_URL}/api/v1/users/browsementor`);
        if (!res.ok) throw new Error('Failed to load mentors');

        const result = await res.json();
        const found = result.data?.find((m: Mentor) => m._id === mentorId);

        if (!found) {
          setError('Mentor not found');
          return;
        }

        setMentor(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load mentor');
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentor();
  }, [mentorId, router]);

  /* -------- Fetch Slots When Date Changes -------- */
  useEffect(() => {
    if (!mentorId || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);

        const dateStr = toDateString(selectedDate);
        const res = await fetch(
          `${API_BASE_URL}/api/v1/bookings/mentor/${mentorId}/slots?date=${dateStr}`
        );

        if (!res.ok) throw new Error('Failed to load slots');

        const result = await res.json();
        setSlots(result.data || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [mentorId, selectedDate]);

  /* -------- Create Booking -------- */
  const handleConfirmBooking = useCallback(async () => {
    if (!mentorId || !selectedDate || !selectedSlot) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mentorId,
          date: toDateString(selectedDate),
          startTime: selectedSlot.startTime,
          sessionType,
          notes,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Booking failed');
      }

      setBookingResult(result.data);
      toast.success('Booking confirmed successfully!');
      setCurrentStep(4);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [mentorId, selectedDate, selectedSlot, sessionType, notes]);

  /* -------- Navigation -------- */
  const canGoNext = () => {
    if (currentStep === 1) return !!mentor;
    if (currentStep === 2) return !!selectedDate && !!selectedSlot;
    if (currentStep === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep === 3) {
      handleConfirmBooking();
      return;
    }
    if (canGoNext()) {
      setCurrentStep((s) => Math.min(s + 1, 4));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  /* ================================================================
     RENDER
     ================================================================ */

  if (loadingMentor) {
    return (
      <DashboardLayout userName="Book a Session">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading mentor details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !mentor) {
    return (
      <DashboardLayout userName="Book a Session">
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <Link
              href="/student/mentors"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Browse Mentors
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const price = mentor?.mentorProfile?.pricePerSession ?? 0;
  const rating = mentor?.mentorProfile?.rating ?? 0;
  const expertise = mentor?.mentorProfile?.expertise ?? [];
  const experience = mentor?.mentorProfile?.experienceYears ?? 0;

  return (
    <DashboardLayout userName="Book a Session">
      <div className="space-y-8 pb-12">
        {/* ======== Progress Bar ======== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-300'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold hidden sm:block transition-colors ${
                        isActive
                          ? 'text-gray-900'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={`h-0.5 rounded-full transition-colors duration-300 ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ======== Error Banner ======== */}
        {error && currentStep !== 4 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 font-bold text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ======== STEP 1: Mentor Overview ======== */}
        {currentStep === 1 && mentor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6 p-8">
                  <div className="relative h-40 w-40 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 shrink-0">
                    <Image
                      src={getImageUrl(mentor.profileImage, mentor.name)}
                      alt={mentor.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {mentor.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                          {mentor.mentorProfile?.bio || 'Experienced mentor ready to help you grow.'}
                        </p>
                      </div>
                      {rating > 0 && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg shrink-0">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {expertise.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Experience
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {experience > 0 ? `${experience}+ yrs` : '0 yrs'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Per Session
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {price > 0 ? `₹${price}` : 'Free'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Format
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          1:1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">What to Expect</h3>
                <div className="space-y-3">
                  {[
                    '1-on-1 personalized session',
                    'Career guidance & feedback',
                    'Resume & portfolio review',
                    'Interview preparation',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pro Tip</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Have your resume and LinkedIn profile ready before the session for the best outcome.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======== STEP 2: Date & Time Selection ======== */}
        {currentStep === 2 && mentor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Calendar Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Select Date</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                      disabled={weekOffset === 0}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 min-w-30 text-center">
                      {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' – '}
                      {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setWeekOffset((w) => Math.min(3, w + 1))}
                      disabled={weekOffset >= 3}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const isPast = day < today;
                    const isSelected =
                      selectedDate && toDateString(day) === toDateString(selectedDate);
                    const isToday = toDateString(day) === toDateString(today);

                    return (
                      <button
                        key={toDateString(day)}
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={`rounded-xl py-4 text-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-300 scale-105'
                            : isPast
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isToday
                                ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 ring-2 ring-cyan-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                        }`}
                      >
                        <p className="text-xs font-bold">
                          {DAY_LABELS[day.getDay()]}
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {day.getDate()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Card */}
              {selectedDate && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Available Times</h2>
                    <p className="text-sm font-medium text-gray-500">
                      {formatDateShort(selectedDate)}
                    </p>
                  </div>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <span className="ml-3 text-gray-600 font-medium">
                        Loading available slots...
                      </span>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No slots available on this day
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try selecting a different date
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot) => {
                        const isSelected =
                          selectedSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            onClick={() =>
                              slot.available && setSelectedSlot(slot)
                            }
                            disabled={!slot.available}
                            className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-300 scale-105'
                                : !slot.available
                                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                            }`}
                          >
                            <span className="block">{formatTime(slot.startTime)}</span>
                            {isSelected && (
                              <span className="block text-xs font-medium mt-1 opacity-80">
                                Selected ✓
                              </span>
                            )}
                            {!slot.available && (
                              <span className="block text-xs font-medium mt-1">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selection Summary Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Your Selection
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Mentor
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {mentor.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedDate
                          ? formatDateShort(selectedDate)
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedSlot
                          ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div>
                    <p className="text-sm text-gray-500 font-medium">Session Fee</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{price > 0 ? `₹${price}` : "Free"}<span className="text-sm font-medium text-gray-500 ml-1">
                        /session
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======== STEP 3: Review & Notes ======== */}
        {currentStep === 3 && mentor && selectedDate && selectedSlot && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Session Type */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Session Format
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {SESSION_TYPES.map((type) => {
                    const TypeIcon = type.icon;
                    const isActive = sessionType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSessionType(type.value)}
                        className={`rounded-xl p-5 text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <TypeIcon
                          size={24}
                          className={isActive ? 'text-white' : 'text-gray-500'}
                        />
                        <p className="text-sm font-bold mt-3">{type.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Session Notes
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Share what you&apos;d like to discuss so {mentor.name} can prepare
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  className="w-full h-32 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
                  placeholder="I'd love to get feedback on my portfolio strategy and discuss potential career paths..."
                />
                <p className="text-xs text-gray-400 mt-2 text-right">
                  {notes.length}/1000
                </p>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sticky top-24 space-y-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Booking Summary
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50 shrink-0">
                      <Image
                        src={getImageUrl(mentor.profileImage, mentor.name)}
                        alt={mentor.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {mentor.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expertise[0] || 'Mentor'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-2 text-gray-600 shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                          Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {formatDate(selectedDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-2 text-gray-600 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                          Time
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {formatTime(selectedSlot.startTime)} –{' '}
                          {formatTime(selectedSlot.endTime)} (45 min)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-2 text-gray-600 shrink-0">
                        <Video size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                          Format
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {SESSION_TYPES.find((t) => t.value === sessionType)
                            ?.label || 'Video Call'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Session Fee
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{price > 0 ? `₹${price}` : "Free"}</p>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="w-full rounded-xl bg-gray-900 py-3.5 text-white font-bold hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Confirm Booking
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By confirming, you agree to our mentoring agreement and
                    24-hour cancellation policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======== STEP 4: Confirmation ======== */}
        {currentStep === 4 && bookingResult && mentor && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-gray-600 mb-8">
                Your session with {mentor.name} has been booked successfully.
              </p>

              {/* Zoom Meeting Link */}
              {sessionType === 'video' && (
                <div className="mb-8">
                  {bookingResult.joinUrl ? (
                    <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-5 text-left">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-cyan-100 p-2.5 shrink-0">
                          <Video className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-cyan-900">Zoom Meeting Ready</p>
                          <p className="text-xs text-cyan-700 mt-1">Your video session link has been generated. You can join at the scheduled time.</p>
                          {bookingResult.zoomMeetingId && (
                            <p className="text-xs text-cyan-600 mt-1">Meeting ID: {bookingResult.zoomMeetingId}</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={bookingResult.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-colors"
                      >
                        <ExternalLink size={16} />
                        Join Zoom Meeting
                      </a>
                    </div>
                  ) : bookingResult.zoomError ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-left">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Zoom link could not be generated</p>
                          <p className="text-xs text-amber-700 mt-1">{bookingResult.zoomError}</p>
                          <p className="text-xs text-amber-600 mt-2">Don&apos;t worry — your mentor will share the meeting link before the session.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 text-left">
                      <div className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Zoom link pending</p>
                          <p className="text-xs text-gray-500 mt-1">The meeting link will be available once your mentor confirms the session.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-gray-50 p-6 space-y-4 text-left mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mentor</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {mentor.name}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedDate ? formatDate(selectedDate) : ''}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTime(bookingResult.startTime)} –{' '}
                    {formatTime(bookingResult.endTime)}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Session Fee</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${bookingResult.price}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {bookingResult.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/student/schedule"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
                >
                  <Calendar size={18} />
                  View Schedule
                </Link>
                <Link
                  href="/browse-mentors"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors"
                >
                  Browse More Mentors
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ======== Navigation Buttons ======== */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between">
            <button
              onClick={currentStep === 1 ? () => router.back() : handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={16} />
              {currentStep === 1 ? 'Back' : 'Previous'}
            </button>

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Step
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
