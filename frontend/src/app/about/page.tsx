import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-28 lg:px-8 lg:pt-32">
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-br from-white via-blue-50 to-indigo-100 p-8 sm:p-10 lg:p-14">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              About EdMarg
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Building confident career decisions through mentorship and structure
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              EdMarg is a career mentorship platform designed to help learners identify the right direction,
              build practical skills, and execute a roadmap with expert support.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{item.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">{value.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-blue-100 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
            We believe every learner deserves clear direction, not confusion. Our mission is to make career growth
            practical and personalized by combining guided assessments, industry mentorship, and execution-focused
            planning. Whether someone is starting out or pivoting, EdMarg is built to turn intent into outcomes.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
