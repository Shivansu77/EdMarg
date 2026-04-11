'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BadgeCheck, Zap, Target, Users, TrendingUp, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const competencies = [
  {
    title: 'UX Research',
    description:
      'Your ability to synthesize complex qualitative data into actionable insights is in the top 5th percentile of applicants.',
    icon: Target,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Visual Design',
    description:
      'You possess a natural eye for hierarchy and balance, ensuring that information is not just functional, but aesthetically pleasing.',
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Interaction Design',
    description:
      'Logic-driven flow creation comes easily to you. You predict user behavior before the first click happens.',
    icon: Users,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
];

function ResultsContent() {
  return (
    <DashboardLayout userName="Assessment Results">
      <div className="space-y-8 pb-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-cyan-50/50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                Assessment Intelligence
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Your Career Fit Summary</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                We&apos;ve curated your professional identity based on 42 unique markers, matching aptitude, thinking style, and growth potential.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-90">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Match Score</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">98%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signals Analyzed</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">42</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[1fr_320px] lg:p-10">
            <div>
              <div className="mb-6">
                <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-bold tracking-widest text-slate-700">
                  MATCH SCORE: 98%
                </span>
              </div>

              <h2 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-5xl">
                Your Recommended Path:
                <br />
                <span className="text-cyan-700">Product Design</span>
              </h2>

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-700 lg:text-lg">
                Your aptitude for empathizing with user pain points combined with a strong structural logic suggests you would
                excel in roles that bridge the gap between human needs and technical constraints. You prioritize clarity,
                flow, and visual harmony.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/student/mentors">
                  <button className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                    Find a Mentor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                  View Full Syllabus
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 to-cyan-50">
                <div className="absolute inset-4 rounded-2xl border border-white/70 bg-white/40" />
                <BadgeCheck size={96} className="relative text-slate-900" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-6">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">Core Competencies</h3>
            <p className="mt-2 text-sm text-slate-600">Three pillars identified as your natural strengths.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {competencies.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                    <Icon size={24} className={item.color} strokeWidth={2} />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h4>
                  <p className="text-base leading-relaxed text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <Award className="mt-1 h-6 w-6 shrink-0 text-slate-900" />
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Why Product Design?</h3>
            </div>
            <p className="mb-6 text-base leading-relaxed text-slate-700">
              Based on your assessment, you demonstrated a high &quot;Holistic Thinking&quot; score. Product Design requires a
              candidate to look at the &apos;Big Picture&apos; while obsessing over the details—a trait you displayed throughout
              the behavioral section of the quiz.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-base text-slate-700">
                <span className="font-bold text-slate-900">120+ Product Designers</span> are ready to mentor you today.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-900 p-8 text-white shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <TrendingUp className="mt-1 h-6 w-6 shrink-0 text-cyan-300" />
              <h3 className="text-2xl font-extrabold tracking-tight">Mentorship Impact</h3>
            </div>
            <p className="mb-6 text-base leading-relaxed text-slate-200">
              Students who follow their recommended path with a mentor see a <span className="font-bold text-white">45% faster</span> job placement rate.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div className="h-full w-[75%] rounded-full bg-cyan-300" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Industry Readiness: 75%</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-2xl font-extrabold tracking-tight text-slate-900">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Browse Mentors</p>
                <p className="mt-1 text-sm text-slate-600">Find mentors who specialize in Product Design</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Book a Session</p>
                <p className="mt-1 text-sm text-slate-600">Schedule your first mentorship session</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-900">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900">Start Learning</p>
                <p className="mt-1 text-sm text-slate-600">Get personalized guidance and feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <ResultsContent />
    </ProtectedRoute>
  );
}
