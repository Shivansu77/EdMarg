'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BadgeCheck, Zap, Target, Users, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

const competencies = [
  {
    title: 'UX Research',
    description:
      'Your ability to synthesize complex qualitative data into actionable insights is in the top 5th percentile of applicants.',
    icon: Target,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
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
        {/* Intro */}
        <div>
          <p className="text-gray-600">We&apos;ve curated your professional identity based on 42 unique markers.</p>
        </div>

        {/* Main Result Card */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 p-8 lg:p-12">
            {/* Left Content */}
            <div>
              <div className="mb-6">
                <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold tracking-widest text-gray-700">
                  MATCH SCORE: 98%
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
                Your Recommended Path:
                <br />
                <span className="text-gray-600">Product Design</span>
              </h2>

              <p className="text-lg leading-relaxed text-gray-700 mb-8 max-w-2xl">
                Your aptitude for empathizing with user pain points combined with a strong structural logic suggests you would
                excel in roles that bridge the gap between human needs and technical constraints. You prioritize clarity,
                flow, and visual harmony.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/student/mentors">
                  <button className="rounded-lg bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition-colors">
                    Find a Mentor
                  </button>
                </Link>
                <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-900 font-semibold hover:bg-gray-50 transition-colors">
                  View Full Syllabus
                </button>
              </div>
            </div>

            {/* Right Badge */}
            <div className="flex items-center justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-gray-200 bg-gray-50">
                <BadgeCheck size={100} className="text-gray-900" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Core Competencies */}
        <section>
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900">Core Competencies</h3>
            <p className="text-gray-600 mt-2">Three pillars identified as your natural strengths.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {competencies.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${item.bg} mb-4`}>
                    <Icon size={24} className={item.color} strokeWidth={2} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-base leading-relaxed text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Why Product Design */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="flex items-start gap-3 mb-4">
              <Award className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
              <h3 className="text-2xl font-bold text-gray-900">Why Product Design?</h3>
            </div>
            <p className="text-base leading-relaxed text-gray-700 mb-6">
              Based on your assessment, you demonstrated a high &quot;Holistic Thinking&quot; score. Product Design requires a
              candidate to look at the &apos;Big Picture&apos; while obsessing over the details—a trait you displayed throughout
              the behavioral section of the quiz.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-base text-gray-700">
                <span className="font-bold text-gray-900">120+ Product Designers</span> are ready to mentor you today.
              </p>
            </div>
          </div>

          {/* Mentorship Impact */}
          <div className="rounded-2xl border border-gray-200 bg-gray-900 text-white p-8">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <h3 className="text-2xl font-bold">Mentorship Impact</h3>
            </div>
            <p className="text-base leading-relaxed text-gray-200 mb-6">
              Students who follow their recommended path with a mentor see a <span className="font-bold text-white">45% faster</span> job placement rate.
            </p>
            <div className="mb-4">
              <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                <div className="h-full w-[75%] rounded-full bg-white" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Industry Readiness: 75%</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-900 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Mentors</p>
                <p className="text-sm text-gray-600 mt-1">Find mentors who specialize in Product Design</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-900 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Book a Session</p>
                <p className="text-sm text-gray-600 mt-1">Schedule your first mentorship session</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-900 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Start Learning</p>
                <p className="text-sm text-gray-600 mt-1">Get personalized guidance and feedback</p>
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
