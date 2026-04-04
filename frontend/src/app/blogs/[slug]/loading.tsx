import { BlogShell } from '@/modules/blog/components/BlogShell';

export default function BlogDetailsLoading() {
  return (
    <BlogShell>
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-64 animate-pulse bg-slate-200 sm:h-80 lg:h-[28rem]" />
        <div className="space-y-4 p-6 sm:p-10">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </BlogShell>
  );
}
