import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Compass, LineChart, Users } from 'lucide-react';

const values = [
  {
    title: 'Career Clarity First',
    description:
      'We help students and early professionals move from uncertainty to focused, realistic career decisions.',
  },
  {
    title: 'Mentorship That Executes',
    description:
      'Our approach is action-oriented: every session should translate into measurable progress and confidence.',
  },
  {
    title: 'Data-Guided Decisions',
    description:
      'Assessments and structured reflection turn guesswork into informed career planning.',
  },
];

const stats = [
  { label: 'Learners Guided', value: '10,000+' },
  { label: 'Mentor Sessions', value: '35,000+' },
  { label: 'Career Tracks', value: '40+' },
  { label: 'Satisfaction Score', value: '4.8/5' },
];

const pillars = [
  {
    title: 'Discover',
    description: 'Understand your strengths, interests, and role-fit signals with structured diagnostics.',
    icon: Compass,
  },
  {
    title: 'Design',
    description: 'Build a clear action roadmap with milestones, learning priorities, and mentor guidance.',
    icon: LineChart,
  },
  {
    title: 'Deliver',
    description: 'Execute consistently through focused mentorship sessions and measurable weekly progress.',
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-28 lg:px-8 lg:pt-32">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-cyan-50/60 p-8 shadow-sm sm:p-10 lg:p-14">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-indigo-200/35 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
              About EdMarg
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Building confident career decisions through mentorship and structure
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                EdMarg helps learners move from uncertainty to execution with a clear path: discover strengths,
                choose the right direction, and progress with mentor-backed accountability.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/signup"
                  className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="/blogs"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Read Our Insights
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Focus Areas</p>
              <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
                <li>Career Direction</li>
                <li>Mentor Matching</li>
                <li>Skill Roadmaps</li>
                <li>Execution Support</li>
              </ul>
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
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">How We Work</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            EdMarg is built as an execution engine, not just an advisory platform. We combine structured assessments,
            personalized mentor pathways, and progress loops so each learner can make visible career momentum.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
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
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">{value.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Our Mission</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
            <span className="text-slate-200">
              We believe every learner deserves clear direction, not confusion. Our mission is to make career growth
              practical and personalized by combining guided assessments, industry mentorship, and execution-focused
              planning. Whether someone is starting out or pivoting, EdMarg is built to turn intent into outcomes.
            </span>
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            Direction {'->'} Action {'->'} Outcome
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
