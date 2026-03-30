'use client';

import React from 'react';
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
  Activity
} from 'lucide-react';

const studentRequests = [
  { name: 'Sarah Johnson', track: 'UX Design', status: 'Pending' },
  { name: 'Michael Chen', track: 'Product Management', status: 'Accepted' },
];

const updates = [
  { icon: MessageSquare, iconColor: 'text-indigo-500', bg: 'bg-indigo-50', title: 'New message from Sarah', text: 'Can we reschedule our session?', date: '2 hours ago' },
  { icon: Sparkles, iconColor: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Session feedback received', text: 'Alex left a 5-star review for your mentorship.', date: 'Today' },
  { icon: Target, iconColor: 'text-amber-500', bg: 'bg-amber-50', title: 'New student request', text: 'Emma Rodriguez applied to be mentored by you.', date: 'This week' },
];

const history = [
  { title: 'Session with Alex Thompson', subtitle: 'March 12, 2024 · 1 hour', detail: 'Career guidance and resume review' },
  { title: 'Session with Jordan Lee', subtitle: 'March 05, 2024 · 45 min', detail: 'Portfolio feedback and next steps' },
];

const stats = [
  { label: 'Total sessions', value: '42', sub: 'this month', trend: '+12% vs last' },
  { label: 'Pending requests', value: '5', sub: 'awaiting response', trend: 'Action needed' },
  { label: 'Completion rate', value: '92%', sub: 'on schedule', trend: 'Excellent' },
  { label: 'Avg rating', value: '4.9', sub: 'out of 5', trend: 'Top 5% mentor' },
];

const upcomingSessions = [
  { title: 'Session with Sarah Johnson', detail: 'UX Design mentorship and portfolio review', meta: 'Today · 2:00 PM', primary: true },
  { title: 'Review pending requests', detail: 'Respond to 5 new student applications.', meta: 'This week', primary: false },
  { title: 'Update availability', detail: 'Set your schedule for next month.', meta: 'Optional', primary: false },
];

const priorities = [
  { title: 'Pending requests', description: 'Review and respond to new student applications.', href: '/mentor/requests', icon: Users, meta: '5 new' },
  { title: 'Upcoming sessions', description: 'View and manage your scheduled mentoring sessions.', href: '/mentor/schedule', icon: CalendarDays, meta: '3 today' },
  { title: 'Student feedback', description: 'Check reviews and feedback from your mentees.', href: '/mentor/results', icon: MessageSquare, meta: '2 new' },
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

function MentorDashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 px-6 pb-10 pt-8 sm:px-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative z-10">
          <Label>Mentor Workspace</Label>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Guide students, track impact, grow together.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600/90 leading-relaxed tracking-wide">
            Manage your mentoring sessions, respond to requests, and see the difference you&apos;re making — all in one beautifully connected space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/mentor/requests"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95"
            >
              Review requests <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/mentor/schedule"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95"
            >
              View sessions
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
            {/* Upcoming sessions */}
            <Card>
              <div className="flex items-start justify-between gap-4 border-b border-gray-50 bg-gray-50/30 px-6 py-6">
                <div>
                  <Label>This week</Label>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    Stay on top of your mentoring impact
                  </h2>
                </div>
                <span className="mt-1 shrink-0 rounded-full border border-indigo-100 bg-white/80 shadow-sm px-4 py-1.5 text-sm font-bold text-indigo-600">
                  3 sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-3 border-b border-gray-50 px-6 py-5">
                {[
                  { icon: CalendarDays, label: 'Today', bg: 'bg-blue-50', text: 'text-blue-700' },
                  { icon: Clock3, label: '2:00 – 2:45 PM', bg: 'bg-amber-50', text: 'text-amber-700' },
                  { icon: Users, label: '5 pending', bg: 'bg-emerald-50', text: 'text-emerald-700' },
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
                {upcomingSessions.map((item) => (
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
                      {item.meta}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Student requests */}
            <Card>
              <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-6">
                <Label>Student requests</Label>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  New mentees looking for guidance
                </h2>
              </div>
              <ul className="divide-y divide-gray-50/50">
                {studentRequests.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-gray-50/30">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm border border-white text-sm font-bold text-gray-700">
                        {initials(r.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900">{r.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{r.track}</p>
                      </div>
                    </div>
                    <span className={`block rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold ${statusCls[r.status]}`}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            {/* Today's focus */}
            <Card className="overflow-hidden border-indigo-100/50 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.05)]">
              <div className="border-b border-indigo-50/50 bg-gradient-to-br from-indigo-50/80 to-white px-6 py-6">
                <Label>Today&apos;s focus</Label>
                <p className="mt-2 text-xl font-extrabold tracking-tight text-indigo-950">2:00 PM · Sarah Johnson</p>
                <p className="mt-1 text-sm font-medium text-indigo-600/80">UX Design mentorship · portfolio review</p>
              </div>

              <ul className="divide-y divide-gray-50">
                {[
                  { title: 'Review portfolio samples', detail: 'Prepare feedback on recent design work.', meta: 'Must have' },
                  { title: 'Discuss career goals', detail: 'Explore internship opportunities and next steps.', meta: '5 min' },
                  { title: 'Share resources', detail: 'Provide relevant articles and design tools.', meta: 'Optional' },
                ].map((item) => (
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

              <div className="px-6 pb-6 pt-5 bg-gray-50/30 border-t border-gray-50">
                <div className="flex gap-3">
                  <Link
                    href="/mentor/schedule"
                    className="flex-1 rounded-xl bg-gray-900 py-3 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    View schedule
                  </Link>
                  <Link
                    href="/mentor/schedule"
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

          {/* History */}
          <Card>
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5 bg-gray-50/30">
              <Label>Recent sessions</Label>
              <Link
                href="/mentor/requests?tab=past"
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
