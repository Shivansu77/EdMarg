'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const studentRequests = [
  { name: 'Sarah Johnson', track: 'UX Design', status: 'Pending' },
  { name: 'Michael Chen', track: 'Product Management', status: 'Accepted' },
];

const updates = [
  { icon: MessageSquare, title: 'New message from Sarah', text: 'Can we reschedule our session?', date: '2 hours ago' },
  { icon: Sparkles, title: 'Session feedback received', text: 'Alex left a 5-star review for your mentorship.', date: 'Today' },
  { icon: Target, title: 'New student request', text: 'Emma Rodriguez applied to be mentored by you.', date: 'This week' },
];

const history = [
  { title: 'Session with Alex Thompson', subtitle: 'March 12, 2024 · 1 hour', detail: 'Career guidance and resume review' },
  { title: 'Session with Jordan Lee', subtitle: 'March 05, 2024 · 45 min', detail: 'Portfolio feedback and next steps' },
];

const stats = [
  { label: 'Total sessions', value: '42', sub: 'this month' },
  { label: 'Pending requests', value: '5', sub: 'awaiting response' },
  { label: 'Completion rate', value: '92%', sub: 'on schedule' },
  { label: 'Avg rating', value: '4.9', sub: 'out of 5' },
];

const upcomingSessions = [
  { title: 'Session with Sarah Johnson', detail: 'UX Design mentorship and portfolio review', meta: 'Today · 2:00 PM', primary: true },
  { title: 'Review pending requests', detail: 'Respond to 5 new student applications.', meta: 'This week', primary: false },
  { title: 'Update availability', detail: 'Set your schedule for next month.', meta: 'Optional', primary: false },
];

const priorities = [
  { title: 'Pending requests', description: 'Review and respond to new student applications.', href: '/mentor/requests', icon: Users, meta: '5 new' },
  { title: 'Upcoming sessions', description: 'View and manage your scheduled mentoring sessions.', href: '/mentor/sessions', icon: CalendarDays, meta: '3 today' },
  { title: 'Student feedback', description: 'Check reviews and feedback from your mentees.', href: '/mentor/feedback', icon: MessageSquare, meta: '2 new' },
];

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const statusCls: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      {children}
    </p>
  );
}

function MentorDashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 pb-8 pt-6 sm:px-8">
        <Label>Mentor workspace</Label>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          Guide students, track impact, grow together.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          Manage your mentoring sessions, respond to requests, and see the difference you're making — all in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mentor/requests"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4e45e2] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#4139c2] active:scale-95"
          >
            Review requests <ArrowRight size={18} strokeWidth={2} />
          </Link>
          <Link
            href="/mentor/sessions"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            View sessions
          </Link>
        </div>
      </div>

      <div className="space-y-6 px-6 pt-8 sm:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-5 ${i < stats.length - 1 ? 'border-r border-gray-200' : ''}`}
            >
              <Label>{s.label}</Label>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-gray-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Upcoming sessions */}
            <Card>
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                <div>
                  <Label>This week</Label>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    Stay on top of your mentoring impact
                  </h2>
                </div>
                <span className="mt-1 shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-600">
                  3 sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-gray-200 px-6 py-4">
                {[
                  { icon: CalendarDays, label: 'Today' },
                  { icon: Clock3, label: '2:00 – 2:45 PM' },
                  { icon: Users, label: '5 pending' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    <Icon size={16} strokeWidth={2} /> {label}
                  </span>
                ))}
              </div>

              <ul className="divide-y divide-gray-200">
                {upcomingSessions.map((item) => (
                  <li key={item.title} className="flex items-start justify-between gap-4 px-6 py-5">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
                    </div>
                    <span
                      className={`mt-1 shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                        item.primary
                          ? 'bg-[#4e45e2] text-white'
                          : 'border border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {item.meta}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Student requests */}
            <Card>
              <div className="border-b border-gray-200 px-6 py-5">
                <Label>Student requests</Label>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  New mentees looking for guidance
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {studentRequests.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-4 px-6 py-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-600">{r.track}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCls[r.status]}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Today's focus */}
            <Card>
              <div className="border-b border-gray-200 px-6 py-5">
                <Label>Today&apos;s focus</Label>
                <p className="mt-2 text-lg font-bold text-gray-900">2:00 PM · Sarah Johnson</p>
                <p className="mt-1 text-sm text-gray-600">UX Design mentorship · portfolio review</p>
              </div>

              <ul className="divide-y divide-gray-200">
                {[
                  { title: 'Review portfolio samples', detail: 'Prepare feedback on recent design work.', meta: 'Must have' },
                  { title: 'Discuss career goals', detail: 'Explore internship opportunities and next steps.', meta: '5 min' },
                  { title: 'Share resources', detail: 'Provide relevant articles and design tools.', meta: 'Optional' },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3 px-6 py-5">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gray-300" strokeWidth={2} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {item.meta}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3">
                  <Link
                    href="/mentor/sessions"
                    className="flex-1 rounded-lg bg-[#4e45e2] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4139c2]"
                  >
                    View schedule
                  </Link>
                  <Link
                    href="/mentor/sessions"
                    className="flex-1 rounded-lg border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Reschedule
                  </Link>
                </div>
              </div>
            </Card>

            {/* Priority actions */}
            <Card>
              <div className="border-b border-gray-200 px-6 py-5">
                <Label>Priority actions</Label>
              </div>
              <ul className="divide-y divide-gray-200">
                {priorities.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-gray-50"
                    >
                      <item.icon size={18} className="shrink-0 text-[#4e45e2]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.meta}</span>
                        <ChevronRight
                          size={16}
                          className="text-gray-400 transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Updates */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <Label>Latest updates</Label>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
                3 new
              </span>
            </div>
            <ul className="divide-y divide-gray-200">
              {updates.map((u) => (
                <li key={u.title} className="flex items-start gap-4 px-6 py-5">
                  <u.icon size={18} className="mt-0.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{u.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{u.text}</p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">{u.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* History */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <Label>Recent sessions</Label>
              <Link
                href="/mentor/history"
                className="text-sm font-semibold text-[#4e45e2] transition-colors hover:text-[#4139c2]"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-gray-200">
              {history.map((item) => (
                <li key={item.title} className="flex items-start gap-3 px-6 py-5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs text-gray-600">{item.subtitle}</p>
                    <p className="mt-1 text-xs text-gray-600">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MentorDashboard() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorDashboardLayout>
        <MentorDashboardContent />
      </MentorDashboardLayout>
    </ProtectedRoute>
  );
}
