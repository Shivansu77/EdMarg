'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogContent } from '@/modules/blog/components/BlogContent';
import { BlogCard } from '@/modules/blog/components/BlogCard';
import { BlogPost } from '@/modules/blog/types';
import { getBlogBySlugFromAPI, getAllBlogsFromAPI } from '@/services/blog.service';
import { updateSEOMetadata, injectArticleStructuredData, updateSEO404 } from '@/utils/seo';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchBlogData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch single blog
        const fetchedBlog = await getBlogBySlugFromAPI(slug);
        
        if (!fetchedBlog) {
          setError('404');
          setBlog(null);
          setRelatedBlogs([]);
          updateSEO404();
          return;
        }

        setBlog(fetchedBlog);

        // Update SEO metadata with blog data
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://edmarg.com';
        const blogUrl = `${siteUrl}/blogs/${slug}`;
        
        updateSEOMetadata({
          title: `${fetchedBlog.title} | EdMarg Blog`,
          description: fetchedBlog.description || 'Read this insightful article on EdMarg Blog.',
          url: blogUrl,
          type: 'article',
          image: fetchedBlog.image || `${siteUrl}/og-blog-image.png`,
          author: fetchedBlog.author,
          publishedDate: fetchedBlog.date,
        });

        // Inject Article structured data (JSON-LD)
        injectArticleStructuredData({
          title: fetchedBlog.title,
          description: fetchedBlog.description || '',
          image: fetchedBlog.image || `${siteUrl}/og-blog-image.png`,
          author: fetchedBlog.author,
          publishDate: fetchedBlog.date,
          url: blogUrl,
        });

        // Fetch all blogs to find related ones
        try {
          const allBlogs = await getAllBlogsFromAPI();
          const related = allBlogs
            .filter((b) => b.slug !== slug)
            .slice(0, 3);
          setRelatedBlogs(related);
        } catch (err) {
          console.warn('Failed to fetch related blogs:', err);
          // Don't fail if related blogs can't be loaded
          setRelatedBlogs([]);
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogData();
  }, [slug]);

  if (loading) {
    return (
      <BlogShell>
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-64 animate-pulse bg-slate-200 sm:h-80 lg:h-112" />
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

  if (error === '404' || !blog) {
    return (
      <BlogShell>
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-rose-900">Blog not found</h1>
          <p className="mt-3 text-sm text-rose-700">
            The article you are trying to read does not exist or may have been moved.
          </p>
          <Link
            href="/blogs"
            className="mt-6 inline-flex rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Back to Blogs
          </Link>
        </section>
      </BlogShell>
    );
  }

  if (error) {
    return (
      <BlogShell>
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-3xl font-extrabold text-rose-900">Error Loading Blog</h1>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
          <Link
            href="/blogs"
            className="mt-6 inline-flex rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            Back to Blogs
          </Link>
        </section>
      </BlogShell>
    );
  }

  return (
    <BlogShell>
      <BlogContent blog={blog} />

      {relatedBlogs.length > 0 && (
        <section className="mx-auto mt-10 w-full max-w-4xl">
          <div className="mb-5 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">Related Blogs</h2>
            <Link href="/blogs" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((relatedBlog) => (
              <BlogCard key={relatedBlog.id} blog={relatedBlog} />
            ))}
          </div>
        </section>
      )}
    </BlogShell>
  );
}
