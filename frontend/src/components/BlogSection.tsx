import React from 'react';
import Link from 'next/link';

const BLOG_POSTS = [
  {
    category: "Engineering",
    categoryColor: "bg-[#6B46FF] text-white",
    title: "Top 10 Skills Every Software Engineer Needs in 2026",
    excerpt: "From system design to AI integration, here are the must-have skills for modern engineers.",
    readTime: "5 min read",
    date: "Mar 18, 2026",
  },
  {
    category: "Medical",
    categoryColor: "bg-[#4ADE80] text-gray-900",
    title: "How to Choose Between MBBS and Allied Health Sciences",
    excerpt: "A comprehensive guide for students confused about their medical career path.",
    readTime: "7 min read",
    date: "Mar 15, 2026",
  },
  {
    category: "Business",
    categoryColor: "bg-[#FFD147] text-gray-900",
    title: "From MBA to Startup: A Practical Roadmap",
    excerpt: "Real stories from founders who transitioned from corporate to building their own ventures.",
    readTime: "6 min read",
    date: "Mar 12, 2026",
  },
  {
    category: "Design",
    categoryColor: "bg-pink-400 text-white",
    title: "UX Design Trends That Will Dominate This Year",
    excerpt: "AI-powered design tools, spatial computing, and the return of skeuomorphism.",
    readTime: "4 min read",
    date: "Mar 10, 2026",
  },
  {
    category: "Government",
    categoryColor: "bg-sky-400 text-white",
    title: "UPSC vs State PSC: Which Path is Right for You?",
    excerpt: "An honest comparison of preparation strategy, difficulty, and career outcomes.",
    readTime: "8 min read",
    date: "Mar 8, 2026",
  },
  {
    category: "IT / Tech",
    categoryColor: "bg-gray-900 text-white",
    title: "Cloud Computing Certifications Worth Pursuing",
    excerpt: "AWS, Azure, or GCP — which cloud certification will boost your career the most?",
    readTime: "5 min read",
    date: "Mar 5, 2026",
  },
];

const BlogSection = () => {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8 w-full bg-surface relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-surface-dim rounded-full opacity-25 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-surface-dim rounded-full opacity-25 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-surface-dim text-on-surface text-xs font-semibold px-3 py-1.5 rounded-md border border-border shadow-sm mb-6 uppercase tracking-widest">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Blog & Insights
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 md:mb-5 leading-[1.1] text-on-surface">
              Career insights from{' '}
              <span className="text-on-surface-variant font-medium">
                every domain
              </span>
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed font-manrope">
              Expert articles, guides, and stories to help you navigate your career path.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-on-surface bg-surface border border-border rounded-md hover:bg-surface-dim transition-colors shadow-sm self-start md:self-auto whitespace-nowrap font-manrope"
          >
            View all posts
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {BLOG_POSTS.map((post, idx) => (
            <article
              key={idx}
              className="group bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
            >
              {/* Color Bar Top */}
              <div className="h-1 w-full bg-border group-hover:bg-primary transition-colors"></div>

              <div className="p-5 md:p-6 flex flex-col flex-1">
                {/* Category Badge */}
                <div className="inline-flex self-start items-center text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-md border border-border bg-surface-dim text-on-surface mb-4">
                  {post.category}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-on-surface text-base md:text-lg tracking-tight mb-2 md:mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed mb-5 flex-1 line-clamp-2 font-manrope">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] md:text-xs text-on-surface-variant font-medium pt-4 border-t border-border font-manrope">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
