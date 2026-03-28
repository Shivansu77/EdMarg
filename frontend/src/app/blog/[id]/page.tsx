import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllBlogPosts, getBlogPostById } from '@/data/blogs';

type BlogDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPostById(id);

  if (!post) {
    return {
      title: 'Blog Not Found | EdMarg',
    };
  }

  return {
    title: `${post.title} | EdMarg Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const post = getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content.split('\n\n');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-28 lg:px-8 lg:pt-32">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Back to Blog
          </Link>

          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 border-b border-gray-100 pb-6 text-sm text-slate-500">
            <p className="font-medium text-slate-700">By {post.author}</p>
            <p>{formatDate(post.createdAt)}</p>
          </div>

          <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
