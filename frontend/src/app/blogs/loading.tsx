import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogListSkeleton } from '@/modules/blog/components/states/BlogListSkeleton';

export default function BlogsLoading() {
  return (
    <BlogShell>
      <section className="mb-10 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
      </section>

      <BlogListSkeleton />
    </BlogShell>
  );
}
