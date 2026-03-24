'use client';

import React, { useRef } from 'react';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const MENTORS = [
  { name: 'Dr. Aris V.', role: 'Senior Product Designer', company: 'Google', rating: 4.9, students: 340, successRate: 94, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', tags: ['UX Design', 'Career Growth'] },
  { name: 'Sarah Chen', role: 'Software Architect', company: 'Stripe', rating: 5.0, students: 210, successRate: 98, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', tags: ['System Design', 'Fintech'] },
  { name: 'Marcus Thorne', role: 'Strategy Lead', company: 'McKinsey', rating: 4.8, students: 480, successRate: 91, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', tags: ['Consulting', 'Leadership'] },
];

const TopMentorsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (d: 'left' | 'right') => scrollRef.current?.scrollBy({ left: d === 'left' ? -350 : 350, behavior: 'smooth' });

  return (
    <section id="mentors" className="py-20 lg:py-32 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold text-gray-900 tracking-tight mb-4 font-plus-jakarta">
              Learn from the Best
            </h2>
            <p className="text-lg text-gray-600 font-manrope">
              Get direct access to mentors from the world's most innovative companies.
            </p>
          </div>
          <div className="flex items-center gap-2 hidden md:flex">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors" aria-label="Previous mentor">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors" aria-label="Next mentor">
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Mentor Cards Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 lg:gap-8 pb-8 snap-x snap-mandatory hide-scrollbar"
        >
          {MENTORS.map((mentor, idx) => (
            <div
              key={idx}
              className="min-w-[85vw] sm:min-w-[350px] lg:min-w-0 snap-center group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                <Image 
                  src={mentor.image} 
                  alt={mentor.name} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Rating Pill */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white backdrop-blur-md rounded-full shadow-sm border border-gray-100/50">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{mentor.rating}</span>
                </div>

                <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  Featured Mentor
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-indigo-500" />
                  {mentor.company}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-md border border-gray-100 font-manrope">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Name & Role */}
                <h3 className="text-2xl font-bold text-gray-900 font-plus-jakarta mb-1">
                  {mentor.name}
                </h3>
                <p className="text-gray-600 font-manrope mb-6">
                  {mentor.role} <span className="text-gray-400 mx-1">•</span> <span className="font-semibold text-gray-900">{mentor.company}</span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span className="font-bold">{mentor.students}+</span>
                    </div>
                    <span className="text-xs text-gray-500 font-manrope">Students Guided</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold">{mentor.successRate}%</span>
                    </div>
                    <span className="text-xs text-gray-500 font-manrope">Success Rate</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <Link
                    href="/connect"
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-gray-900 bg-white border border-gray-200 flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 group-hover:border-indigo-200 group-hover:bg-indigo-50/50"
                  >
                    View Mentor Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Hide Scrollbar CSS injection (inline for simplicity if not in globals) */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default TopMentorsSection;
