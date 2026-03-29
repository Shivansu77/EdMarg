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
  Activity
} from 'lucide-react';

const requests = [
  { name: 'Alex Vance', track: 'Product Design', status: 'Pending' },
  { name: 'Emily Chen', track: 'Software Engineering', status: 'Accepted' },
];

const updates = [
  { icon: MessageSquare, iconColor: 'text-indigo-500', bg: 'bg-indigo-50', title: 'New message from Sarah', text: "Prep notes are ready for today's session.", date: '2 hours ago' },
  { icon: Sparkles, iconColor: 'text-amber-500', bg: 'bg-amber-50', title: 'Assessment reminder', text: 'Finish the baseline assessment to unlock stronger matches.', date: 'Today' },
  { icon: Target, iconColor: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Next milestone', text: 'Portfolio review unlocks after one more guided session.', date: 'This week' },
];

const history = [
  { title: 'Initial consulting', subtitle: 'March 12, 2024 · Dr. Michael', detail: 'Goal setting and career direction' },
  { title: 'Resume workshop', subtitle: 'March 05, 2024 · Jessica K.', detail: 'Resume cleanup and positioning' },
];

const stats = [
  { label: 'Assessment', value: '2 / 5', sub: 'sections done', trend: '+1 this week' },
  { label: 'Next session', value: '2:00 PM', sub: 'Today · Sarah Wells', trend: 'In 2 hours' },
  { label: 'Mentor matches', value: '3', sub: 'new this week', trend: 'High match score' },
  { label: 'Roadmap', value: '46%', sub: 'complete', trend: 'On track' },
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
  { title: 'Plan next session', description: 'Book or adjust a session this week.', href: '/student/mentors', icon: CalendarDays, meta: 'Open' },
];

const milestones = [
  { title: 'Complete baseline assessment', detail: 'Map your strengths, interests, and work style.', status: 'Current', dot: 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] ring-4 ring-indigo-50', label: 'text-indigo-600' },
  { title: 'Review mentor shortlist', detail: 'Save mentors that best fit your target path.', status: 'Next', dot: 'bg-gray-300', label: 'text-gray-500' },
  { title: 'Portfolio review session', detail: 'Turn recent work into sharper applications.', status: 'Later', dot: 'bg-gray-300 border border-white', label: 'text-gray-400' },
];

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const statusCls: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-sm',
  Accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm',
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500/80">
      {children}
    </p>
  );
}

function StudentDashboardContent() {
  return (
    <DashboardLayout userName="Student Dashboard">
      <div className="min-h-screen bg-gray-50/50 pb-16">
        {/* Dynamic Header */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 px-6 pb-10 pt-8 sm:px-8">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
          
          <div className="relative z-10">
            <Label>Student Workspace</Label>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Your week, organized around the next right move.
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-gray-600/90 leading-relaxed tracking-wide">
              See your session, finish the assessment, and keep your plan moving — all in one beautifully connected space.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/student/assessment"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
              >
                Continue assessment <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/student/mentors"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
              >
                Browse Mentors
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 pt-8 sm:px-8 max-w-[1600px] mx-auto">
          {/* Stats Glassmorphic Board */}
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group relative px-6 py-6 transition-colors hover:bg-gray-50/50 ${i < stats.length - 1 ? 'border-r border-gray-100' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <Label>{s.label}</Label>
                  <Activity size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 group-hover:text-indigo-900 transition-colors">
                  {s.value}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 font-medium">
                  {s.sub}
                </p>
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Main 2-col */}
          <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
            {/* Left */}
            <div className="space-y-8">
              {/* Weekly plan */}
              <Card>
                <div className="flex items-start justify-between gap-4 border-b border-gray-50 px-6 py-6 bg-gray-50/30">
                  <div>
                    <Label>This week</Label>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                      Keep today useful and the rest obvious
                    </h2>
                  </div>
                  <span className="mt-1 shrink-0 rounded-full border border-indigo-100 bg-white/80 shadow-sm px-4 py-1.5 text-sm font-bold text-indigo-600">
                    46% done
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 border-b border-gray-50 px-6 py-5">
                  {[
                    { icon: CalendarDays, label: 'Today', bg: 'bg-blue-50', text: 'text-blue-700' },
                    { icon: Clock3, label: '2:00 – 2:45 PM', bg: 'bg-amber-50', text: 'text-amber-700' },
                    { icon: Users, label: '3 new matches', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                  ].map(({ icon: Icon, label, bg, text }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-2 rounded-xl ${bg} ${text} px-3.5 py-2 text-sm font-semibold shadow-sm`}
                    >
                      <Icon size={16} strokeWidth={2.5} /> {label}
                    </span>
                  ))}
                </div>

                <ul className="divide-y divide-gray-50/50">
                  {weeklyPlan.map((item) => (
                    <li key={item.title} className="group flex items-start justify-between gap-4 px-6 py-6 transition-colors hover:bg-gray-50/30">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">{item.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500 font-medium">{item.detail}</p>
                      </div>
                      <span
                        className={`mt-1 shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide shadow-sm ${
                          item.primary
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-600 group-hover:border-indigo-200'
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
                <div className="border-b border-gray-50 px-6 py-6 bg-gray-50/30">
                  <div className="flex justify-between items-end">
                    <div>
                      <Label>Career roadmap</Label>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                        How today connects to the bigger plan
                      </h2>
                    </div>
                  </div>
                  <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-gray-100 shadow-inner">
                    <div className="h-full w-[46%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)] relative">
                       <div className="absolute top-0 right-0 w-4 h-full bg-white/30 blur-[2px]"></div>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-8">
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-10 py-2">
                    {milestones.map((m, idx) => (
                      <div key={m.title} className={`relative pl-8 ${idx !== milestones.length - 1 ? '' : ''}`}>
                        <span className={`absolute -left-[5px] top-1 h-3 w-3 rounded-full ${m.dot}`} />
                        <div className="min-w-0 flex-1 -mt-1 group">
                          <div className="flex items-center justify-between gap-3">
                            <p className={`text-base font-semibold transition-colors ${idx === 0 ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{m.title}</p>
                            <span className={`shrink-0 text-xs uppercase tracking-wider font-bold ${m.label}`}>{m.status}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-gray-500/80 font-medium">{m.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right sidebar */}
            <div className="space-y-8">
              {/* Today's focus */}
              <Card className="overflow-hidden border-indigo-100/50 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.05)]">
                <div className="border-b border-indigo-50/50 bg-gradient-to-br from-indigo-50/80 to-white px-6 py-6">
                  <Label>Today&apos;s focus</Label>
                  <p className="mt-2 text-xl font-extrabold tracking-tight text-indigo-950">2:00 PM · Sarah Wells</p>
                  <p className="mt-1 text-sm font-medium text-indigo-600/80">Career mentorship · product & growth</p>
                </div>

                <ul className="divide-y divide-gray-50">
                  {sessionPrep.map((item) => (
                    <li key={item.title} className="group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50/50">
                      <div className="mt-1 rounded-full bg-emerald-50 p-1">
                         <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900">{item.title}</p>
                          <span className="rounded-md bg-white border border-gray-100 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold text-gray-500 shadow-sm">
                            {item.meta}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-50 px-6 py-5 bg-gray-50/30">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-50 p-2">
                       <MessageSquare size={16} className="text-blue-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Latest mentor note</p>
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        Prep notes are ready for today&apos;s session.
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 bg-gray-50/30">
                  <div className="flex gap-3">
                    <Link
                      href="/student/schedule"
                      className="flex-1 rounded-xl bg-gray-900 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      View schedule
                    </Link>
                    <Link
                      href="/student/mentors"
                      className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm py-3 text-center text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      Reschedule
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Priority actions */}
              <Card>
                <div className="border-b border-gray-50 px-6 py-5 bg-gray-50/30">
                  <Label>Priority actions</Label>
                </div>
                <ul className="divide-y divide-gray-50/50">
                  {priorities.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-4 px-6 py-5 transition-all hover:bg-indigo-50/30"
                      >
                        <div className="rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-100 shadow-sm group-hover:bg-white group-hover:ring-indigo-200 transition-colors">
                            <item.icon size={20} className="shrink-0 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900 transition-colors">{item.title}</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-500">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md">{item.meta}</span>
                          <ChevronRight
                            size={18}
                            strokeWidth={2.5}
                            className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500"
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
          <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
            {/* Updates */}
            <Card>
              <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5 bg-gray-50/30">
                <Label>Latest updates</Label>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200/50 shadow-sm">
                  3 new alerts
                </span>
              </div>
              <ul className="divide-y divide-gray-50/50">
                {updates.map((u) => (
                  <li key={u.title} className="group flex items-start gap-5 px-6 py-6 transition-colors hover:bg-gray-50/30">
                    <div className={`rounded-xl p-3 ${u.bg} shadow-sm ring-1 ring-black/5`}>
                        <u.icon size={20} className={`shrink-0 ${u.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <p className="text-base font-bold text-gray-900 group-hover:text-indigo-900">{u.title}</p>
                         <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap ml-4">{u.date}</p>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-gray-500">{u.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Requests + History */}
            <div className="space-y-8">
              <Card>
                <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5 bg-gray-50/30">
                  <Label>Active requests</Label>
                </div>
                <ul className="divide-y divide-gray-50/50">
                  {requests.map((r) => (
                    <li key={r.name} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-gray-50/30">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm border border-white text-sm font-bold text-gray-700">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">{r.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{r.track}</p>
                      </div>
                      <span className={`block rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold ${statusCls[r.status]}`}>
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5 bg-gray-50/30">
                  <Label>Recent history</Label>
                  <Link
                    href="/student/history"
                    className="group flex flex-row items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600 transition-colors hover:text-indigo-800"
                  >
                    View all <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <ul className="divide-y divide-gray-50/50">
                  {history.map((item) => (
                    <li key={item.title} className="group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-gray-50/30">
                      <div className="mt-0.5 rounded-full bg-gray-100 p-1.5 shadow-sm group-hover:bg-indigo-50 transition-colors">
                         <Clock3 size={14} className="text-gray-500 group-hover:text-indigo-500 transition-colors" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-900">{item.title}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">{item.subtitle}</p>
                        <p className="mt-1.5 text-xs font-medium text-gray-500 leading-relaxed">{item.detail}</p>
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
