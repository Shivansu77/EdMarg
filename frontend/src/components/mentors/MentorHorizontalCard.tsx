'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Briefcase, ChevronRight, User, Globe } from 'lucide-react';


import { getImageUrl } from '@/utils/imageUrl';
interface MentorHorizontalCardProps {
  mentor: {
    _id: string;
    name: string;
    profileImage?: string;
    mentorProfile?: {
      expertise?: string[];
      bio?: string;
      experienceYears?: number;
      pricePerSession?: number;
      rating?: number;
      totalSessions?: number;
    };
  };
  isLoggedIn: boolean;
}

const MentorHorizontalCard = ({ mentor, isLoggedIn }: MentorHorizontalCardProps) => {
  const rating = mentor.mentorProfile?.rating ?? 5.0;
  const reviews = mentor.mentorProfile?.totalSessions ?? 82;
  const expertise =
    mentor.mentorProfile?.expertise?.slice(0, 5) || [
      'React',
      'CSS',
      'JavaScript',
      'Frontend',
      'Architecture',
    ];

  const bio =
    mentor.mentorProfile?.bio ||
    "Hello! I'm a passionate mentor helping engineers grow professionally.";

  const price = mentor.mentorProfile?.pricePerSession ?? 100;
  const experience = mentor.mentorProfile?.experienceYears ?? 5;

  return (
    <div className="group w-full bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg">

      {/* Featured Badge */}
      <div className="absolute right-10">
        <div className="bg-black text-white px-4 py-1 rounded-b-lg text-[10px] font-semibold tracking-widest uppercase">
          Featured
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Image */}
          <div className="relative w-full md:w-[160px] h-[160px] rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
            {mentor.profileImage ? (
              <Image
                src={getImageUrl(mentor.profileImage, mentor.name)}
                alt={mentor.name}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User size={42} className="text-gray-400" />
              </div>
            )}

            {/* Rating */}
            <div className="absolute bottom-3 left-3 bg-white border border-gray-200 px-3 py-1 rounded-md flex items-center gap-1 shadow-sm">
              <Star size={12} className="fill-black text-black" />
              <span className="text-xs font-medium">
                {Number(rating).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">

            <div>
              <h2 className="text-2xl font-semibold text-black">
                {mentor.name}
              </h2>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} />
                  <span>Founder at FrontPrep</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <span>{experience > 0 ? `${experience}+ Years` : "Expertise"}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-700 leading-relaxed max-w-2xl line-clamp-3">
              {bio}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {expertise.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-md text-xs border border-gray-200 bg-gray-50 text-gray-700 hover:bg-black hover:text-white transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="w-full md:w-56 flex md:flex-col items-center md:items-end justify-between gap-5 md:border-l border-gray-200 md:pl-6">

            <div className="text-left md:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Session Price
              </p>

              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold text-black">
                  {price > 0 ? `₹${price}` : "Free"}
                </span>
                <span className="text-xs text-gray-500">/session</span>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {reviews} sessions completed
              </p>
            </div>

            <Link
              href={isLoggedIn ? `/student/booking?id=${mentor._id}` : '/login'}
              className="w-full"
            >
              <button className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-black/80 transition-all flex items-center justify-center gap-2">
                Book Session
                <ChevronRight size={18} />
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MentorHorizontalCard;