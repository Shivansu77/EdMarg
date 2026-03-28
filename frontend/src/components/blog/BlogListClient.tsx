'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/data/blogs';

type BlogListClientProps = {
  posts: BlogPost[];
  tags: string[];
};

const INITIAL_VISIBLE_POSTS = 6;

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export default function BlogListClient({ posts, tags }: BlogListClientProps) {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesTitle = post.title.toLowerCase().includes(normalizedQuery);
      const matchesTag = selectedTag === 'All' || post.tags.includes(selectedTag);

      return matchesTitle && matchesTag;
    });
  }, [posts, query, selectedTag]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const onSearchChange = (value: string) => {
    setQuery(value);
    setVisibleCount(INITIAL_VISIBLE_POSTS);
  };

  const onTagChange = (tag: string) => {
    setSelectedTag(tag);
    setVisibleCount(INITIAL_VISIBLE_POSTS);
  };

  return (
    <>
      <section className="mb-10 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <label htmlFor="blog-search" className="mb-2 block text-sm font-semibold text-gray-700">
              Search blogs
            </label>
            <input
              id="blog-search"
              type="text"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="w-full md:w-auto">
            <p className="mb-2 text-sm font-semibold text-gray-700">Categories</p>
            <div className="flex flex-wrap gap-2">
              {['All', ...tags].map((tag) => {
                const isActive = selectedTag === tag;

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagChange(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visiblePosts.map((post) => (
          <article
            key={post.id}
            className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="mb-3 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-blue-700">
              {post.title}
            </h2>

            <p className="mb-5 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>

            <div className="mb-6 mt-auto border-t border-gray-100 pt-4 text-sm text-gray-500">
              <p>By {post.author}</p>
              <p>{formatDate(post.createdAt)}</p>
            </div>

            <Link
              href={`/blog/${post.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Read More
            </Link>
          </article>
        ))}
      </section>

      {filteredPosts.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm text-gray-600">No blog posts matched your search.</p>
        </div>
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_POSTS)}
            className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
