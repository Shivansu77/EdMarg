import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_URL } from '@/utils/site-url';
import {
  ArrowRight,
  Compass,
  LineChart,
  Target,
  Users,
  Rocket,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | EdMarg',
  description:
    'Learn how EdMarg helps students and early professionals build career clarity through assessments, mentorship, and execution-focused planning.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | EdMarg',
    description:
      'Learn how EdMarg helps students and early professionals build career clarity through assessments, mentorship, and execution-focused planning.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

const stats = [
  { label: 'Learners Guided', value: '10,000+' },
  { label: 'Mentor Sessions', value: '35,000+' },
  { label: 'Career Tracks', value: '40+' },
  { label: 'Satisfaction Score', value: '4.8/5' },
];

const pillars = [
  {
    title: 'Discover',
    description: 'Identify strengths, interests, and fit using structured assessments.',
    icon: Compass,
  },
  {
    title: 'Plan',
    description: 'Turn insights into a clear roadmap with priorities and milestones.',
    icon: LineChart,
  },
  {
    title: 'Execute',
    description: 'Move forward consistently with mentor accountability and feedback.',
    icon: Target,
  },
];

const values = [
  {
    title: 'Learner First',
    description: 'Every product decision starts with student outcomes, not vanity metrics.',
    icon: Users,
  },
  {
    title: 'Execution Over Noise',
    description: 'We focus on practical next steps so progress is visible every week.',
    icon: Rocket,
  },
  {
    title: 'Trust and Transparency',
    description: 'Clear recommendations, real mentors, and honest feedback at every stage.',
    icon: ShieldCheck,
  },
];

const timeline = [
  {
    year: '2023',
    title: 'Idea Sparked',
    description: 'EdMarg started with one goal: make career guidance clear and actionable.',
  },
  {
    year: '2024',
    title: 'Mentor Network Built',
    description: 'We onboarded industry mentors and launched structured one-on-one pathways.',
  },
  {
    year: '2025',
    title: 'Assessment Engine Released',
    description: 'Career assessments were connected with personalized mentorship journeys.',
  },
  {
    year: 'Today',
    title: 'Outcome-Driven Growth',
    description: 'We continue refining a platform where direction turns into measurable outcomes.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-28 lg:px-8 lg:pt-32">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-cyan-50/60 p-8 shadow-sm sm:p-10 lg:p-14">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-emerald-200/35 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                About Us
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                We help learners turn career confusion into confident action
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                EdMarg combines guided assessments, expert mentors, and execution-first planning so students and
                early professionals can choose the right direction and keep moving with clarity.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/assessment"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Take Assessment
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">What We Solve</p>
              <div className="mt-4 space-y-3">
                {['Career indecision', 'Lack of structure', 'Generic advice', 'No accountability'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">How EdMarg Works</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            We are not an advice-only platform. We run an end-to-end progression loop that helps learners discover
            the right path, create a practical plan, and execute it with expert support.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Our Story</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              EdMarg was built to close the gap between ambition and execution. Here is how our journey evolved.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {timeline.map((item) => (
              <article key={item.year} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">{item.year}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-900 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Our Mission</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Every learner deserves career direction that is practical, personalized, and actionable. We are building
            a platform where clarity leads to consistent action, and action leads to real outcomes.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Join EdMarg
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              Explore Insights
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
