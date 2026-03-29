'use client';

import React, { useRef } from 'react';
import { Award, BriefcaseBusiness, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const MENTORS = [
  { name: 'Dr. Aris V.', role: 'Senior Product Designer', company: 'Google', rating: 4.9, students: 340, successRate: 94, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', tags: ['UX Design', 'Career Growth'] },
  { name: 'Sarah Chen', role: 'Software Architect', company: 'Stripe', rating: 5.0, students: 210, successRate: 98, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', tags: ['System Design', 'Fintech'] },
  { name: 'Marcus Thorne', role: 'Strategy Lead', company: 'McKinsey', rating: 4.8, students: 480, successRate: 91, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', tags: ['Consulting', 'Leadership'] },
];

const TopMentorsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (d: 'left' | 'right') => scrollRef.current?.scrollBy({ left: d === 'left' ? -350 : 350, behavior: 'smooth' });

  return (
    <section id="mentors" className="py-20 lg:py-28 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Learn from the Best
            </h2>
            <p className="text-lg text-gray-600">
              Get direct access to mentors from the world&apos;s most innovative companies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/browse-mentors"
              className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Browse All Mentors
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors" aria-label="Previous mentor">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors" aria-label="Next mentor">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mentor Cards */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
        >
          {MENTORS.map((mentor, idx) => (
            <div
              key={idx}
              className="group relative flex min-w-[85vw] snap-center flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg sm:min-w-87.5 lg:min-w-0"
            >
              {/* Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                <Image 
                  src={mentor.image} 
                  alt={mentor.name} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-md border border-gray-200">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{mentor.rating}</span>
                </div>

                {/* Company Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-600" />
                  {mentor.company}
                </div>
              </div>

              {/* Content */}
              <div className="flex grow flex-col p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Name & Role */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {mentor.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {mentor.role} <span className="text-gray-400">•</span> <span className="font-semibold text-gray-900">{mentor.company}</span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-bold">{mentor.students}+</span>
                    </div>
                    <span className="text-xs text-gray-600">Students Guided</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="font-bold">{mentor.successRate}%</span>
                    </div>
                    <span className="text-xs text-gray-600">Success Rate</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <Link
                    href="/browse-mentors"
                    className="w-full py-2.5 rounded-lg font-semibold text-sm text-gray-900 bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 transition-all hover:bg-gray-100 hover:border-gray-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
