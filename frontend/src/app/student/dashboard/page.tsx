'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MessageSquare,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const requests = [
  { name: 'Alex Vance', track: 'Product Design', status: 'Pending' },
  { name: 'Emily Chen', track: 'Software Engineering', status: 'Accepted' },
];

const updates = [
  { icon: MessageSquare, title: 'New message from Sarah', text: "Prep notes are ready for today's session.", date: '2 hours ago' },
  { icon: Sparkles, title: 'Assessment reminder', text: 'Finish the baseline assessment to unlock stronger matches.', date: 'Today' },
  { icon: Target, title: 'Next milestone', text: 'Portfolio review unlocks after one more guided session.', date: 'This week' },
];

const history = [
  { title: 'Initial consulting', subtitle: 'March 12, 2024 · Dr. Michael', detail: 'Goal setting and career direction' },
  { title: 'Resume workshop', subtitle: 'March 05, 2024 · Jessica K.', detail: 'Resume cleanup and positioning' },
];

const stats = [
  { label: 'Assessment', value: '2 / 5', sub: 'sections done' },
  { label: 'Next session', value: '2:00 PM', sub: 'Today · Sarah Wells' },
  { label: 'Mentor matches', value: '3', sub: 'new this week' },
  { label: 'Roadmap', value: '46%', sub: 'complete' },
];

const sessionPrep = [
  { title: 'Bring your latest resume', detail: "Use one you've already applied with so feedback stays specific.", meta: 'Must have' },
  { title: 'Choose one internship role', detail: 'Anchor the session around a real target instead of broad advice.', meta: '5 min' },
  { title: 'Note one portfolio question', detail: 'Turn the call into concrete feedback you can act on right after.', meta: 'Optional' },
];

const weeklyPlan = [
  { title: 'Complete baseline assessment', detail: 'Takes 8 minutes. Refreshes your mentor recommendations right away.', badge: 'High impact', primary: true },
  { title: "Review Sarah's prep note", detail: 'Focus on internship applications and portfolio positioning.', badge: 'Today', primary: false },
  { title: 'Save two backup mentors', detail: 'Keep follow-up mentors ready before the week gets busy.', badge: 'Optional', primary: false },
];

const priorities = [
  { title: 'Complete assessment', description: 'Unlock better matching and a clearer plan.', href: '/student/assessment', icon: ClipboardCheck, meta: '8 min' },
  { title: 'Review mentor matches', description: 'Compare mentors aligned with your goals.', href: '/student/mentors', icon: Users, meta: '3 new' },
  { title: 'Plan next session', description: 'Book or adjust a session this week.', href: '/student/booking', icon: CalendarDays, meta: 'Open' },
];

const milestones = [
  { title: 'Complete baseline assessment', detail: 'Map your strengths, interests, and work style.', status: 'Current', dot: 'bg-[#4e45e2]', label: 'text-[#4e45e2]' },
  { title: 'Review mentor shortlist', detail: 'Save mentors that best fit your target path.', status: 'Next', dot: 'bg-emerald-500', label: 'text-emerald-600' },
  { title: 'Portfolio review session', detail: 'Turn recent work into sharper applications.', status: 'Later', dot: 'bg-gray-300', label: 'text-gray-500' },
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

function StudentDashboardContent() {
  return (
    <DashboardLayout userName="Student Dashboard">
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 pb-8 pt-6 sm:px-8">
          <Label>Student workspace</Label>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Your week, organized around the next right move.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            See your session, finish the assessment, and keep your plan moving — all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4e45e2] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#4139c2] active:scale-95"
            >
              Continue assessment <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href="/student/mentors"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Browse mentors
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
              {/* Weekly plan */}
              <Card>
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
                  <div>
                    <Label>This week</Label>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                      Keep today useful and the rest obvious
                    </h2>
                  </div>
                  <span className="mt-1 shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-600">
                    46% done
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-gray-200 px-6 py-4">
                  {[
                    { icon: CalendarDays, label: 'Today' },
                    { icon: Clock3, label: '2:00 – 2:45 PM' },
                    { icon: Users, label: '3 new matches' },
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
                  {weeklyPlan.map((item) => (
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
                        {item.badge}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Roadmap */}
              <Card>
                <div className="border-b border-gray-200 px-6 py-5">
                  <Label>Career roadmap</Label>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    How today connects to the bigger plan
                  </h2>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-[46%] rounded-full bg-[#4e45e2]" />
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {milestones.map((m) => (
                    <li key={m.title} className="flex items-start gap-4 px-6 py-5">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${m.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-base font-semibold text-gray-900">{m.title}</p>
                          <span className={`shrink-0 text-sm font-semibold ${m.label}`}>{m.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{m.detail}</p>
                      </div>
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
                  <p className="mt-2 text-lg font-bold text-gray-900">2:00 PM · Sarah Wells</p>
                  <p className="mt-1 text-sm text-gray-600">Career mentorship · product &amp; growth</p>
                </div>

                <ul className="divide-y divide-gray-200">
                  {sessionPrep.map((item) => (
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

                <div className="border-t border-gray-200 px-6 py-5">
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="mt-0.5 shrink-0 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Latest mentor note</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Prep notes are ready for today&apos;s session.
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <Link
                      href="/student/schedule"
                      className="flex-1 rounded-lg bg-[#4e45e2] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4139c2]"
                    >
                      View schedule
                    </Link>
                    <Link
                      href="/student/booking"
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

            {/* Requests + History */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                  <Label>Active requests</Label>
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
                    {requests.length}
                  </span>
                </div>
                <ul className="divide-y divide-gray-200">
                  {requests.map((r) => (
                    <li key={r.name} className="flex items-center gap-4 px-6 py-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-600">{r.track}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCls[r.status]}`}>
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                  <Label>Recent history</Label>
                  <Link
                    href="/student/history"
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
      </div>
    </DashboardLayout>
  );
}

export default function StudentDashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
