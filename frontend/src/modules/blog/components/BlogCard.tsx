'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '../types';
import { formatBlogDate } from '../utils';

interface BlogCardProps {
  blog: BlogPost;
}

export function BlogCard({ blog }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);
  const blogHref = `/blogs/${blog.slug}`;

  const imageUrl = imageError
    ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80'
    : blog.image;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={blogHref} className="absolute inset-0 z-10" aria-label={`Open blog: ${blog.title}`} />
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={blog.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span className="text-xs text-slate-500">Image unavailable</span>
          </div>
        )}
      </div>

      <div className="relative z-20 flex flex-1 flex-col gap-3 p-5 pointer-events-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{formatBlogDate(blog.date)}</p>

        <h2 className="line-clamp-2 text-xl font-extrabold leading-tight text-slate-900">{blog.title}</h2>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{blog.description}</p>

        <div className="mt-auto pt-3">
          <Link
            href={blogHref}
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 pointer-events-auto"
          >
            Open Article
          </Link>
        </div>
      </div>
    </article>
  );
}
