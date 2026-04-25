/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { BlogPost } from '../types';
import { formatBlogDate } from '../utils';

interface BlogContentProps {
  blog: BlogPost;
}

export function BlogContent({ blog }: BlogContentProps) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = imageError
    ? 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80'
    : blog.image;

  return (
    <article className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-64 w-full sm:h-80 lg:h-[28rem]">
        <img
          src={imageUrl}
          alt={blog.title}   
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <span className="text-sm text-slate-500">Image unavailable</span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-10">
        <p className="text-sm font-semibold text-sky-700">
          By {blog.author} · {formatBlogDate(blog.date)}
        </p>

        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          {blog.title}
        </h1>

        <div
          className="mt-8 space-y-5 text-[1.02rem] leading-8 text-slate-700 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:py-1"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </article>
  );
}
