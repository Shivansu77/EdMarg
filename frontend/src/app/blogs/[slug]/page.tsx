import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogShell } from '@/modules/blog/components/BlogShell';
import { BlogContent } from '@/modules/blog/components/BlogContent';
import { BlogCard } from '@/modules/blog/components/BlogCard';
import { BlogPost } from '@/modules/blog/types';
import { getBlogBySlugFromAPI, getAllBlogsFromAPI } from '@/services/blog.service';
import { SITE_URL } from '@/utils/site-url';

type BlogRouteParams = {
  slug: string;
};

const fallbackDescription = 'Read this insightful article on EdMarg Blog.';
const getBlogBySlugCached = cache(async (slug: string) => getBlogBySlugFromAPI(slug));

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const blogs = await getAllBlogsFromAPI();
    return blogs
      .filter((blog) => Boolean(blog.slug))
      .map((blog) => ({ slug: blog.slug }));
  } catch (error) {
    console.error('Failed to generate blog static params:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogRouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await getBlogBySlugCached(slug);

    if (!blog) {
      return {
        title: 'Blog not found | EdMarg',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const blogUrl = `${SITE_URL}/blogs/${slug}`;
    const description = blog.description || fallbackDescription;

    return {
      title: `${blog.title} | EdMarg Blog`,
      description,
      alternates: {
        canonical: `/blogs/${slug}`,
      },
      openGraph: {
        type: 'article',
        title: `${blog.title} | EdMarg Blog`,
        description,
        url: blogUrl,
        publishedTime: blog.date,
        modifiedTime: blog.date,
        images: blog.image ? [{ url: blog.image, alt: blog.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${blog.title} | EdMarg Blog`,
        description,
        images: blog.image ? [blog.image] : undefined,
      },
    };
  } catch (error) {
    console.error('Failed to generate blog metadata:', error);
    return {
      title: 'Blog | EdMarg',
      description: fallbackDescription,
      alternates: {
        canonical: `/blogs/${slug}`,
      },
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<BlogRouteParams>;
}) {
  const { slug } = await params;

  const blog = await getBlogBySlugCached(slug);
  if (!blog) {
    notFound();
  }

  let relatedBlogs: BlogPost[] = [];

  try {
    const allBlogs = await getAllBlogsFromAPI();
    relatedBlogs = allBlogs.filter((post) => post.slug !== slug).slice(0, 3);
  } catch (error) {
    console.warn('Failed to fetch related blogs:', error);
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.description || fallbackDescription,
    image: blog.image || undefined,
    datePublished: blog.date,
    dateModified: blog.date,
    author: {
      '@type': 'Person',
      name: blog.author || 'EdMarg',
    },
    publisher: {
      '@type': 'Organization',
      name: 'EdMarg',
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blogs/${slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blogs',
        item: `${SITE_URL}/blogs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `${SITE_URL}/blogs/${slug}`,
      },
    ],
  };

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
