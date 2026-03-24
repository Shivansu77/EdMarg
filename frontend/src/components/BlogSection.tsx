'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BLOG_POSTS = [
  { category: "Engineering", categoryColor: "bg-[#7C3AED] text-white", title: "Top 10 Skills Every Software Engineer Needs in 2026", excerpt: "From system design to AI integration, here are the must-have skills for modern engineers.", readTime: "5 min read", date: "Mar 18, 2026", accentColor: '#7C3AED' },
  { category: "Medical", categoryColor: "bg-[#10B981] text-white", title: "How to Choose Between MBBS and Allied Health Sciences", excerpt: "A comprehensive guide for students confused about their medical career path.", readTime: "7 min read", date: "Mar 15, 2026", accentColor: '#10B981' },
  { category: "Business", categoryColor: "bg-[#F59E0B] text-white", title: "From MBA to Startup: A Practical Roadmap", excerpt: "Real stories from founders who transitioned from corporate to building their own ventures.", readTime: "6 min read", date: "Mar 12, 2026", accentColor: '#F59E0B' },
  { category: "Design", categoryColor: "bg-[#EC4899] text-white", title: "UX Design Trends That Will Dominate This Year", excerpt: "AI-powered design tools, spatial computing, and the return of skeuomorphism.", readTime: "4 min read", date: "Mar 10, 2026", accentColor: '#EC4899' },
  { category: "Government", categoryColor: "bg-[#06B6D4] text-white", title: "UPSC vs State PSC: Which Path is Right for You?", excerpt: "An honest comparison of preparation strategy, difficulty, and career outcomes.", readTime: "8 min read", date: "Mar 8, 2026", accentColor: '#06B6D4' },
  { category: "IT / Tech", categoryColor: "bg-[#1A1A2E] text-white", title: "Cloud Computing Certifications Worth Pursuing", excerpt: "AWS, Azure, or GCP — which cloud certification will boost your career the most?", readTime: "5 min read", date: "Mar 5, 2026", accentColor: '#A78BFA' },
];

const BlogSection = () => {
  return (
    <section className="py-16 md:py-24 px-5 md:px-8 w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#7C3AED]/15 mb-6 uppercase tracking-widest">Blog & Insights</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 md:mb-5 leading-[1.1] text-[#1A1A2E] font-sora">
              Career insights from <span className="text-[#6B7280]">every domain</span>
            </h2>
            <p className="text-[#6B7280] text-base md:text-lg leading-relaxed font-inter">Expert articles, guides, and stories to help you navigate your career path.</p>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#1A1A2E] bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all shadow-sm self-start md:self-auto whitespace-nowrap font-inter">
            View all posts
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {BLOG_POSTS.map((post, idx) => (
            <motion.article key={idx} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer">
              <div className="h-1 w-full bg-gray-100 group-hover:bg-[#7C3AED] transition-colors duration-300" />
              <div className="p-5 md:p-6 flex flex-col flex-1">
                <div className={`inline-flex self-start items-center text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${post.categoryColor}`}>{post.category}</div>
                <h3 className="font-semibold text-[#1A1A2E] text-base md:text-lg tracking-tight mb-2 md:mb-3 leading-snug group-hover:text-[#7C3AED] transition-colors line-clamp-2 font-sora">{post.title}</h3>
                <p className="text-[#6B7280] text-xs md:text-sm leading-relaxed mb-5 flex-1 line-clamp-2 font-inter">{post.excerpt}</p>
                <div className="flex items-center justify-between text-[10px] md:text-xs text-[#9CA3AF] font-medium pt-4 border-t border-gray-100 font-inter">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
