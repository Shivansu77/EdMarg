import Link from 'next/link';
import { BlogPost } from '../types';
import { formatBlogDate } from '../utils';

interface BlogCardProps {
  blog: BlogPost;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{formatBlogDate(blog.date)}</p>

        <h2 className="line-clamp-2 text-xl font-extrabold leading-tight text-slate-900">{blog.title}</h2>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{blog.description}</p>

        <div className="mt-auto pt-3">
          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
