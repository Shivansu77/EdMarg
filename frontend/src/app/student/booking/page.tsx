'use client';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Star,
  Video,
  Lightbulb,
  Check,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const days = [
  { label: 'MON', date: '14' },
  { label: 'TUE', date: '15', active: true },
  { label: 'WED', date: '16' },
  { label: 'THU', date: '17' },
  { label: 'FRI', date: '18' },
  { label: 'SAT', date: '19' },
];

const slots = [
  { time: '09:00 AM' },
  { time: '11:30 AM' },
  { time: '03:00 PM', active: true },
  { time: '04:30 PM' },
  { time: '05:00 PM' },
  { time: '07:00 PM', disabled: true },
];

const tags = ['Product Management', 'Career Pivot', 'Interview Prep', 'Portfolio Review'];

function BookingContent() {
  return (
    <DashboardLayout userName="Book a Session">
      <div className="space-y-8 pb-12">
        {/* Mentor Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 p-8">
            {/* Mentor Image */}
            <div className="h-40 w-40 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
            </div>

            {/* Mentor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Elena Rodriguez</h1>
                  <p className="text-gray-600 mt-1">Senior Product Strategist @ Fintech Global</p>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">4.9</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Experience</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">12+ Years</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Students</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">140+</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Sessions</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">500+</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button className="rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-colors h-fit whitespace-nowrap">
              Connect
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Time Selection & Request */}
          <div className="lg:col-span-2 space-y-6">
            {/* Time Selection Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Select a Time Slot</h2>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Days */}
              <div className="grid grid-cols-6 gap-2 mb-8">
                {days.map((day) => (
                  <button
                    key={`${day.label}-${day.date}`}
                    className={`rounded-lg py-3 text-center transition-all ${
                      day.active
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="text-xs font-semibold">{day.label}</p>
                    <p className="text-lg font-bold mt-1">{day.date}</p>
                  </button>
                ))}
              </div>

              <p className="text-sm font-medium text-gray-600 mb-4">Available times for Tuesday, June 15</p>

              {/* Time Slots */}
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      slot.active
                        ? 'bg-gray-900 text-white'
                        : slot.disabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Raise a Request</h3>
              <p className="text-sm text-gray-600 mb-6">
                Briefly describe what you'd like to discuss in this session to help Elena prepare.
              </p>
              <textarea
                className="w-full h-32 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="I'd love to get feedback on my portfolio strategy and discuss potential career paths in fintech..."
              />
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div className="space-y-6">
            {/* Booking Details Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h3>

              <div className="space-y-5 mb-6">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 flex-shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Tuesday, June 15</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Time</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">03:00 PM (45 min)</p>
                  </div>
                </div>

                {/* Format */}
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-100 p-2.5 text-gray-600 flex-shrink-0">
                    <Video size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Format</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">1:1 Video Call</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-6" />

              {/* Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 font-medium">Session Fee</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$45.00</p>
              </div>

              {/* CTA Button */}
              <button className="w-full rounded-lg bg-gray-900 py-3 text-white font-semibold hover:bg-gray-800 transition-colors mb-3">
                Confirm Booking
              </button>
              <p className="text-xs text-gray-600 text-center">
                By confirming, you agree to our mentoring agreement and 24-hour cancellation policy.
              </p>
            </div>

            {/* Pro Tip Card */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pro Tip</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Sharing your LinkedIn profile in the request helps mentors provide more personalized advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-gray-900 mb-4">Session Prep</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">Bring your latest resume</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">Choose one target role</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">Prepare one question</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <BookingContent />
    </ProtectedRoute>
  );
}
