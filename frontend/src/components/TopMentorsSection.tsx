'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, Award } from 'lucide-react';
import Link from 'next/link';

const MENTORS = [
  {
    name: 'Dr. Aris V.',
    role: 'Senior Product Designer',
    company: 'Google',
    rating: 4.9,
    reviews: 124,
    students: 340,
    successRate: 94,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    tags: ['UX Design', 'Career Growth'],
    color: '#6366f1',
  },
  {
    name: 'Sarah Chen',
    role: 'Software Architect',
    company: 'Stripe',
    rating: 5.0,
    reviews: 89,
    students: 210,
    successRate: 98,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    tags: ['System Design', 'Fintech'],
    color: '#8b5cf6',
  },
  {
    name: 'Marcus Thorne',
    role: 'Strategy Lead',
    company: 'McKinsey',
    rating: 4.8,
    reviews: 156,
    students: 480,
    successRate: 91,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    tags: ['Consulting', 'Leadership'],
    color: '#06b6d4',
  },
];

const TopMentorsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const next = () => setActiveIdx((prev) => (prev + 1) % MENTORS.length);
  const prev = () => setActiveIdx((prev) => (prev - 1 + MENTORS.length) % MENTORS.length);

  return (
    <section id="mentors" className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eef2ff] border border-[#6366f1]/20 mb-6">
              <Award className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">Top Mentors</span>
            </div>
            <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-on-surface tracking-tight mb-4 font-plus-jakarta">
              Learn from the <span className="gradient-text">Best</span>
            </h2>
            <p className="text-base lg:text-lg text-on-surface-variant font-manrope">
              Get direct access to mentors from the world's most innovative companies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prev} className="w-11 h-11 rounded-xl bg-surface border border-border shadow-sm flex items-center justify-center text-on-surface hover:bg-[#eef2ff] hover:border-[#6366f1]/30 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="w-11 h-11 rounded-xl bg-surface border border-border shadow-sm flex items-center justify-center text-on-surface hover:bg-[#eef2ff] hover:border-[#6366f1]/30 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {MENTORS.map((mentor, idx) => (
            <div
              key={idx}
              className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${
                idx === activeIdx ? 'block' : 'hidden lg:block'
              } lg:block`}
              style={{
                boxShadow: idx === activeIdx
                  ? `0 0 0 2px ${mentor.color}40, 0 20px 60px ${mentor.color}20`
                  : '0 4px 24px rgba(0,0,0,0.06)',
                transform: idx === activeIdx ? 'scale(1)' : 'scale(0.97)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px) scale(1.02)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${mentor.color}40, 0 24px 64px ${mentor.color}25`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = idx === activeIdx ? 'scale(1)' : 'scale(0.97)';
                (e.currentTarget as HTMLElement).style.boxShadow = idx === activeIdx
                  ? `0 0 0 2px ${mentor.color}40, 0 20px 60px ${mentor.color}20`
                  : '0 4px 24px rgba(0,0,0,0.06)';
              }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{background: `linear-gradient(to top, ${mentor.color}60, transparent)`}} />
                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {mentor.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded-lg" style={{color: mentor.color}}>
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-on-surface">{mentor.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-on-surface font-plus-jakarta mb-1">{mentor.name}</h3>
                <p className="text-sm text-on-surface-variant font-manrope mb-4">
                  {mentor.role} @ <span className="font-bold" style={{color: mentor.color}}>{mentor.company}</span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{background: `${mentor.color}10`}}>
                    <Users className="w-4 h-4" style={{color: mentor.color}} />
                    <div>
                      <p className="text-xs font-bold" style={{color: mentor.color}}>{mentor.students}+</p>
                      <p className="text-[10px] text-on-surface-variant">Students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{background: `${mentor.color}10`}}>
                    <Award className="w-4 h-4" style={{color: mentor.color}} />
                    <div>
                      <p className="text-xs font-bold" style={{color: mentor.color}}>{mentor.successRate}%</p>
                      <p className="text-[10px] text-on-surface-variant">Success</p>
                    </div>
                  </div>
                </div>

                {/* Connect Button - appears on hover */}
                <Link
                  href="/connect"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-105"
                  style={{background: `linear-gradient(135deg, ${mentor.color}, ${mentor.color}cc)`}}
                >
                  Connect Now →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile dots */}
        <div className="flex lg:hidden justify-center gap-2 mt-10">
          {MENTORS.map((m, idx) => (
            <button key={idx} onClick={() => setActiveIdx(idx)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: idx === activeIdx ? '2rem' : '0.5rem',
                background: idx === activeIdx ? m.color : '#e2e8f0'
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TopMentorsSection;
