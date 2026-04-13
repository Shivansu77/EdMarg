import type { Metadata } from 'next';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogList } from '@/modules/blog/components/BlogList';
import { BlogPost } from '@/modules/blog/types';
import { getAllBlogsFromAPI } from '@/services/blog.service';
import { SITE_URL } from '@/utils/site-url';

export const metadata: Metadata = {
  title: 'Blog | EdMarg - Career Insights & Mentorship Articles',
  description:
    'Explore practical articles on career clarity, education, mentorship, and growth strategies from EdMarg.',
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'Blog | EdMarg',
    description:
      'Explore practical articles on career clarity, education, mentorship, and growth strategies from EdMarg.',
    url: `${SITE_URL}/blogs`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | EdMarg',
    description:
      'Explore practical articles on career clarity, education, mentorship, and growth strategies from EdMarg.',
  },
};

export const revalidate = 3600;

export default async function BlogsPage() {
  let blogs: BlogPost[] = [];
  let error: string | null = null;

  try {
    blogs = await getAllBlogsFromAPI();
  } catch (fetchError) {
    console.error('Failed to load blogs:', fetchError);
    error = 'Failed to load blogs. Please try again later.';
  }

  const blogItemList = blogs
    .filter((blog) => blog.slug)
    .slice(0, 50)
    .map((blog, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      name: blog.title,
    }));

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'EdMarg Blog',
    description:
      'Explore practical articles on career clarity, education, mentorship, and growth strategies from EdMarg.',
    url: `${SITE_URL}/blogs`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: blogItemList,
    },
  };

  if (error) {
    return (
      <BlogShell>
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-rose-900">Unable to Load Blogs</h2>
          <p className="mt-3 text-sm text-rose-700">{error}</p>
        </section>
      </BlogShell>
    );
  }

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

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

      <BlogList blogs={blogs} />
    </BlogShell>
  );
}
