'use client';

import { useEffect, useState } from 'react';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogList } from '@/modules/blog/components/BlogList';
import { BlogListSkeleton } from '@/modules/blog/components/states/BlogListSkeleton';
import { BlogPost } from '@/modules/blog/types';
import { getAllBlogsFromAPI } from '@/services/blog.service';
import { updateSEOMetadata, injectOrganizationStructuredData } from '@/utils/seo';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update SEO metadata for blog listing page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://edmarg.com';
    updateSEOMetadata({
      title: 'Blog | EdMarg - Career Insights & Mentorship Articles',
      description:
        'Explore insightful articles on education, career growth, exams, and mentorship guidance from EdMarg experts.',
      url: `${siteUrl}/blogs`,
      type: 'website',
      image: `${siteUrl}/og-blog-image.png`,
    });

    // Inject organization structured data
    injectOrganizationStructuredData();
  }, []);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllBlogsFromAPI();
        setBlogs(data);
      } catch (err) {
        console.error('Failed to load blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (error) {
    return (
      <BlogShell>
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-rose-900">Unable to Load Blogs</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Try Again
          </button>
        </section>
      </BlogShell>
    );
  }

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

      {loading ? <BlogListSkeleton /> : <BlogList blogs={blogs} />}
    </BlogShell>
  );
}
