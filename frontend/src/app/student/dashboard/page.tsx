'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  Clock3,
  Compass,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';

const recommendations = [
  'High aptitude for visual systems and storytelling.',
  'Strong collaborative communication in peer sessions.',
  'Consistent interest in product + user behavior.',
  'Above-average score in structured problem framing.',
];

const recentSessions = [
  { title: 'Initial Consulting', date: 'March 12, 2026', mentor: 'Dr. Michael', status: 'Completed' },
  { title: 'Resume Workshop', date: 'March 05, 2026', mentor: 'Jessica K.', status: 'Completed' },
];

const activeMentors = [
  { name: 'Alex Vance', track: 'Product Design', status: 'Pending' },
  { name: 'Emily Chen', track: 'Software Engineering', status: 'Accepted' },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout userName="Alex Johnson">
      <div className="space-y-10 pb-10">
        <section className="rounded-[1.5rem] p-8 md:p-10 text-on-primary bg-[linear-gradient(135deg,#4e45e2_0%,#6e3bd8_100%)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-on-primary/80 font-semibold">Student Dashboard</p>
              <h1 className="text-4xl md:text-5xl leading-tight font-extrabold tracking-[-0.02em] font-manrope">
                Unlock your next career milestone.
              </h1>
              <p className="text-on-primary/85 text-base md:text-lg font-inter">
                You have not completed your baseline assessment yet. Start now to receive curated mentor matches and a personalized path.
              </p>
            </div>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest text-primary px-7 py-3 font-semibold"
            >
              Start Assessment <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Top Recommendation', value: 'UI/UX Designer', icon: Target },
            { label: 'Profile Match', value: '88%', icon: Sparkles },
            { label: 'Core Interests', value: 'Design, Tech', icon: Compass },
          ].map((item) => (
            <article key={item.label} className="bg-surface-container-lowest rounded-[1.5rem] p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
                <item.icon size={22} />
              </div>
              <p className="text-sm text-on-surface-variant font-medium">{item.label}</p>
              <p className="text-2xl font-manrope font-extrabold tracking-[-0.02em]">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <section className="bg-surface-container-low rounded-[1.5rem] p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-manrope font-extrabold tracking-[-0.02em]">Recommended Career Path</h2>
                <button className="text-primary font-semibold text-sm">View Roadmap</button>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Target size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-manrope font-bold">Product Designer</h3>
                    <p className="text-sm text-on-surface-variant">Hybrid path across UX craft, product strategy, and systems thinking.</p>
                  </div>
                  <span className="ml-auto rounded-full px-3 py-1 text-xs font-bold bg-secondary-container text-secondary">High match</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((point) => (
                  <div key={point} className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-2 text-sm text-on-surface-variant">
                    <CircleCheck size={16} className="text-primary shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-manrope font-bold">Recent History</h2>
                <button className="text-primary text-sm font-semibold">View all</button>
              </div>
              <div className="space-y-1">
                {recentSessions.map((session) => (
                  <div key={session.title} className="bg-surface-container-low rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="text-xs text-on-surface-variant">{session.date} with {session.mentor}</p>
                    </div>
                    <span className="text-[11px] uppercase font-bold rounded-full px-3 py-1 bg-tertiary/10 text-tertiary">{session.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <section className="bg-surface-container-low rounded-[1.5rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-manrope font-bold text-lg">Upcoming Session</h3>
                <CalendarDays size={18} className="text-primary" />
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-4 space-y-3">
                <p className="font-semibold">Career Mentorship with Sarah</p>
                <p className="text-sm text-on-surface-variant flex items-center gap-2"><Clock3 size={14} />2:00 PM today · 45 minutes</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-full text-sm text-on-primary bg-[linear-gradient(135deg,#4e45e2_0%,#6e3bd8_100%)]">Join Meeting</button>
                  <button className="px-4 py-2 rounded-full text-sm bg-surface-container-high">Reschedule</button>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low rounded-[1.5rem] p-6 space-y-4">
              <h3 className="font-manrope font-bold text-lg">Active Mentor Requests</h3>
              {activeMentors.map((mentor) => (
                <div key={mentor.name} className="bg-surface-container-lowest rounded-xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <UserRound size={18} className="text-on-surface-variant" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{mentor.name}</p>
                    <p className="text-xs text-on-surface-variant">{mentor.track}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{mentor.status}</span>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
