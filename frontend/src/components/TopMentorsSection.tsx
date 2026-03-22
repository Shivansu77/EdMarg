'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Globe, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

const MENTORS = [
  {
    name: "Dr. Aris V.",
    role: "Senior Product Designer",
    company: "Google",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    tags: ["UX Design", "Career Growth"]
  },
  {
    name: "Sarah Chen",
    role: "Software Architect",
    company: "Stripe",
    rating: 5.0,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
    tags: ["System Design", "Fintech"]
  },
  {
    name: "Marcus Thorne",
    role: "Strategy Lead",
    company: "McKinsey",
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    tags: ["Consulting", "Leadership"]
  }
];

const TopMentorsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => setActiveIdx((prev) => (prev + 1) % MENTORS.length);
  const prev = () => setActiveIdx((prev) => (prev - 1 + MENTORS.length) % MENTORS.length);

  return (
    <section id="mentors" className="py-20 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header with Nav */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-20">
          <div className="max-w-2xl">
            <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold text-on-surface tracking-tight mb-4 font-plus-jakarta">
              Learn from the Best
            </h2>
            <p className="text-base lg:text-lg text-on-surface-variant font-manrope">
              Get direct access to mentors from the world's most innovative companies.
            </p>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={prev}
              className="w-10 h-10 rounded-md bg-surface border border-border shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={next}
              className="w-10 h-10 rounded-md bg-surface border border-border shadow-sm flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Mentors Grid / Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {MENTORS.map((mentor, idx) => (
            <div 
              key={idx}
              className={`bg-surface border border-border rounded-xl p-6 shadow-sm group transition-all duration-500 hover:shadow-md ${
                idx === activeIdx ? 'block' : 'hidden lg:block lg:opacity-60 lg:grayscale-[0.5] lg:scale-95'
              } lg:opacity-100 lg:grayscale-0 lg:scale-100`}
            >
              {/* Image & Tags */}
              <div className="relative aspect-square rounded-lg overflow-hidden mb-6 border border-border shadow-sm">
                <img 
                  src={mentor.image} 
                  alt={mentor.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {mentor.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-surface-dim/90 backdrop-blur-sm border border-border text-[10px] font-semibold text-on-surface uppercase tracking-widest rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-on-surface font-plus-jakarta mb-1 group-hover:text-primary transition-colors">{mentor.name}</h3>
                  <p className="text-sm font-semibold text-on-surface-variant font-manrope">{mentor.role} @ <span className="text-primary">{mentor.company}</span></p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-xs font-bold text-primary">{mentor.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-on-surface/5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Global</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{mentor.reviews} Reviews</span>
                </div>
              </div>

              <Link 
                href="/connect"
                className="mt-6 w-full py-3.5 bg-surface-dim border border-border text-on-surface font-medium rounded-md flex items-center justify-center gap-2 hover:bg-surface-container transition-colors duration-300 font-manrope shadow-sm"
              >
                Book a Session
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex lg:hidden justify-center gap-2 mt-12">
          {MENTORS.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === activeIdx ? 'w-8 bg-primary' : 'bg-on-surface/10'}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TopMentorsSection;
