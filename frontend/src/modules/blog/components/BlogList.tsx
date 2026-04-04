'use client';

import { useEffect, useMemo, useState } from 'react';
import { BlogPost } from '../types';
import { BlogCard } from './BlogCard';
import { BlogListSkeleton } from './states/BlogListSkeleton';

interface BlogListProps {
  blogs: BlogPost[];
}

export function BlogList({ blogs }: BlogListProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const isEmpty = useMemo(() => blogs.length === 0, [blogs]);

  if (loading) {
    return <BlogListSkeleton />;
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-900">No blogs available right now</h2>
        <p className="mt-3 text-sm text-slate-600">New stories will appear here once they are published.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
