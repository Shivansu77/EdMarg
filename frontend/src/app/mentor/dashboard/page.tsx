'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Calendar,
  ChartNoAxesColumn,
  Clock3,
  DollarSign,
  MessageSquare,
  Star,
  Users,
} from 'lucide-react';

const mentorStats = [
  { label: 'Total Mentees', value: '24', icon: Users },
  { label: 'Avg Rating', value: '4.9', icon: Star },
  { label: 'Sessions', value: '142', icon: Calendar },
  { label: 'Hours Mentored', value: '210', icon: Clock3 },
];

const sessions = [
  { student: 'Maya Rodriguez', goal: 'Product Designer', time: '10:00 AM', status: 'Confirmed' },
  { student: 'Daniel Park', goal: 'Frontend Engineer', time: '01:30 PM', status: 'Confirmed' },
  { student: 'Nina Patel', goal: 'Data Analyst', time: '04:00 PM', status: 'Pending' },
];

export default function MentorDashboard() {
  return (
    <DashboardLayout userName="Sarah Mentor">
      <div className="space-y-10 pb-10">
        <section className="rounded-[1.5rem] p-8 md:p-10 text-on-primary bg-[linear-gradient(135deg,#4e45e2_0%,#6e3bd8_100%)]">
          <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-on-primary/80 font-semibold">Mentor Mode</p>
              <h1 className="text-4xl md:text-5xl font-manrope font-extrabold tracking-[-0.02em]">Guide careers with clarity.</h1>
              <p className="text-on-primary/85 text-base md:text-lg">
                Your sessions, mentee outcomes, and monthly performance are curated in one calm workspace.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full px-6 py-3 bg-surface-container-lowest text-primary font-semibold">My Calendar</button>
              <button className="rounded-full px-6 py-3 bg-tertiary text-on-tertiary font-semibold">Create Session</button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {mentorStats.map((stat) => (
            <article key={stat.label} className="rounded-[1.5rem] p-6 bg-surface-container-lowest space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
                <stat.icon size={22} />
              </div>
              <p className="text-sm text-on-surface-variant font-medium">{stat.label}</p>
              <h3 className="text-3xl font-manrope font-extrabold tracking-[-0.02em]">{stat.value}</h3>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <section className="xl:col-span-8 rounded-[1.5rem] p-6 md:p-8 bg-surface-container-low space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-manrope font-extrabold tracking-[-0.02em]">Today&apos;s Sessions</h2>
              <button className="text-primary text-sm font-semibold">View all</button>
            </div>

            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.student} className="bg-surface-container-lowest rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{session.student}</p>
                    <p className="text-sm text-on-surface-variant">Career Goal: {session.goal}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold">{session.time}</p>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{session.status}</span>
                    <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="xl:col-span-4 rounded-[1.5rem] p-6 bg-surface-container-low space-y-6">
            <h2 className="text-xl font-manrope font-bold">Monthly Performance</h2>
            <div className="rounded-2xl p-5 text-on-primary bg-[linear-gradient(135deg,#006592_0%,#4e45e2_100%)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <DollarSign size={22} />
                </div>
                <span className="text-[10px] uppercase tracking-wide font-bold bg-white/20 px-2 py-1 rounded-full">Paid out</span>
              </div>
              <div>
                <p className="text-on-primary/75 text-sm">Total Earnings</p>
                <h3 className="text-3xl font-manrope font-extrabold">$12,450.00</h3>
              </div>
              <div className="space-y-2">
                <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full w-[75%] rounded-full bg-[linear-gradient(90deg,#61c2ff_0%,#4e45e2_100%)]" />
                </div>
                <p className="text-xs text-on-primary/75">75% of monthly target reached</p>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-4 space-y-2">
              <p className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
                <ChartNoAxesColumn size={16} className="text-tertiary" /> Week-over-week growth
              </p>
              <p className="text-2xl font-manrope font-extrabold text-tertiary">+12.4%</p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
