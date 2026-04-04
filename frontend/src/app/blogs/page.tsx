import type { Metadata } from 'next';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogList } from '@/modules/blog/components/BlogList';
import { getAllBlogs } from '@/modules/blog/data/blogs';

export const metadata: Metadata = {
  title: 'Blogs | EdMarg',
  description: 'Browse practical career and mentorship articles from EdMarg.',
};

export default function BlogsPage() {
  const blogs = getAllBlogs();

  return (
    <BlogShell>
      <section className="mb-10 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
          EdMarg Blog
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          Insights that help students make sharper career decisions
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Read practical frameworks, exam strategies, and mentor-led guidance to move from confusion to clarity.
        </p>
      </section>

      <BlogList blogs={blogs} />
    </BlogShell>
  );
}
