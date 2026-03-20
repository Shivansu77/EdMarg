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
    <section className="py-16 md:py-24 px-5 md:px-8 w-full bg-[#FDFBF7] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply opacity-25 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply opacity-25 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm font-bold px-4 py-2 rounded-full border-2 border-orange-300 shadow-[3px_3px_0px_rgba(234,88,12,0.2)] mb-6">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Blog & Insights
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-5 leading-[1.1]">
              Career insights from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                every domain
              </span>
            </h2>
            <p className="text-gray-600 text-base md:text-xl leading-relaxed">
              Expert articles, guides, and stories to help you navigate your career path.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-gray-900 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:shadow-[1px_1px_0px_rgba(17,24,39,1)] hover:translate-x-[2px] hover:translate-y-[2px] self-start md:self-auto whitespace-nowrap"
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
              className="group bg-white rounded-2xl border-2 border-gray-900 shadow-[5px_5px_0px_rgba(17,24,39,1)] hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              {/* Color Bar Top */}
              <div className={`h-2 w-full ${post.categoryColor.split(' ')[0]}`}></div>

              <div className="p-5 md:p-7 flex flex-col flex-1">
                {/* Category Badge */}
                <div className={`inline-flex self-start items-center text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-900 shadow-[2px_2px_0px_rgba(17,24,39,1)] mb-4 ${post.categoryColor}`}>
                  {post.category}
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-gray-900 text-base md:text-lg tracking-tight mb-2 md:mb-3 leading-snug group-hover:text-[#6B46FF] transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-5 flex-1 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-400 font-medium pt-4 border-t border-gray-100">
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
