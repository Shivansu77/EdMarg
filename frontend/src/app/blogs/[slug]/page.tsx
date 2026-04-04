import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogContent } from '@/modules/blog/components/BlogContent';
import { BlogCard } from '@/modules/blog/components/BlogCard';
import { getAllBlogs, getBlogBySlug, getRelatedBlogs } from '@/modules/blog/data/blogs';

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | EdMarg',
      description: 'The blog you are looking for does not exist.',
    };
  }

  return {
    title: `${blog.title} | EdMarg Blog`,
    description: blog.description,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
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

  const relatedBlogs = getRelatedBlogs(blog.slug);

  return (
    <BlogShell>
      <BlogContent blog={blog} />

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
    </BlogShell>
  );
}
