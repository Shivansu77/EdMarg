'use client';
import { getImageUrl } from '@/utils/imageUrl';

import React, { useRef, useEffect, useState } from 'react';
import { Award, BriefcaseBusiness, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Mentor = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    rating?: number;
  };
};

const TopMentorsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");
        const response = await fetch(`${API_URL}/api/v1/users/browsementor`);
        if (response.ok) {
          const result = await response.json();
          const mentorData = Array.isArray(result?.data) ? result.data.slice(0, 3) : [];
          setMentors(mentorData);
        }
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const scroll = (d: 'left' | 'right') => scrollRef.current?.scrollBy({ left: d === 'left' ? -350 : 350, behavior: 'smooth' });

  if (loading) {
    return (
      <section id="mentors" className="py-20 lg:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (mentors.length === 0) {
    return null;
  }

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
              className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-black text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
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
          {mentors.map((mentor) => {
            const tags = mentor.mentorProfile?.expertise?.slice(0, 2) || ['Mentoring'];
            const rating = mentor.mentorProfile?.rating ?? 4.8;
            const students = 150;
            const successRate = 92;
            const image = getImageUrl(mentor.profileImage, mentor.name);
            const role = mentor.mentorProfile?.bio?.substring(0, 50) || 'Career Mentor';
            const company = 'EdMarg';

            return (
            <div
              key={mentor._id}
              className="group relative flex min-w-[85vw] snap-center flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg sm:min-w-87.5 lg:min-w-0"
            >
              {/* Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                <Image 
                  src={image} 
                  alt={mentor.name} 
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-md border border-gray-200">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{rating}</span>
                </div>

                {/* Company Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-black" />
                  {company}
                </div>
              </div>

              {/* Content */}
              <div className="flex grow flex-col p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: string) => (
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
                  {role} <span className="text-gray-400">•</span> <span className="font-semibold text-gray-900">{company}</span>
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Users className="w-4 h-4 text-black" />
                      <span className="font-bold">{students}+</span>
                    </div>
                    <span className="text-xs text-gray-600">Students Guided</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Award className="w-4 h-4 text-black" />
                      <span className="font-bold">{successRate}%</span>
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
            );
          })}
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
