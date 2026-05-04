'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '@/utils/api-client';
import { getImageUrl } from '@/utils/imageUrl';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Star,
  Briefcase,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface RecommendedMentor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    rating?: number;
    totalSessions?: number;
    experienceYears?: number;
    pricePerSession?: number;
    currentTitle?: string;
    currentCompany?: string;
  };
  matchScore: number;
  matchBreakdown?: {
    interest: number;
    quality: number;
    affinity: number;
    freshness: number;
  };
}

interface RecommendedMentorsProps {
  /** 'dashboard' shows a compact view, 'marketplace' shows the full strip */
  variant?: 'dashboard' | 'marketplace';
}

export default function RecommendedMentors({ variant = 'dashboard' }: RecommendedMentorsProps) {
  const [mentors, setMentors] = useState<RecommendedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get<RecommendedMentor[]>('/api/v1/users/recommended-mentors?limit=10');
        if (res.success && Array.isArray(res.data)) {
          setMentors(res.data);
        }
      } catch {
        // silently fail — recommendations are non-critical
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-sm">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (mentors.length === 0) return null;

  const getMatchColor = (score: number) => {
    if (score >= 75) return 'from-emerald-500 to-green-400 text-white';
    if (score >= 50) return 'from-amber-400 to-orange-400 text-white';
    return 'from-slate-400 to-slate-500 text-white';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Match';
  };

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-8 border-b border-white/30 bg-white/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
              {variant === 'marketplace' ? 'Recommended for You' : 'Your Top Matches'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Based on your interests & activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {variant === 'dashboard' && (
            <Link
              href="/student/mentors"
              className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Scrollable Cards */}
      <div className="px-6 py-5 sm:px-8">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {mentors.map((mentor) => {
            const mp = mentor.mentorProfile || {};
            const skills = (mp.expertise || []).slice(0, 3);
            const rating = mp.rating || 0;
            const sessions = mp.totalSessions || 0;
            const price = mp.pricePerSession ?? 0;
            const roleTitle = mp.currentTitle || (skills[0] ? `${skills[0]} Mentor` : 'Mentor');

            return (
              <Link
                key={mentor._id}
                href={`/student/mentors/${mentor._id}`}
                className="group relative flex-shrink-0 w-[300px] rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Match Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r ${getMatchColor(mentor.matchScore)} px-3 py-1 text-[11px] font-extrabold shadow-md`}>
                  <Zap className="h-3 w-3" />
                  {mentor.matchScore}% match
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-extrabold text-xl shrink-0">
                    {mentor.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(mentor.profileImage, mentor.name, 200)}
                        alt={mentor.name}
                        className="h-full w-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      mentor.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {mentor.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{roleTitle}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold mb-4">
                  {rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    {sessions} sessions
                  </span>
                  {price > 0 && (
                    <span className="font-bold text-slate-700">₹{price}</span>
                  )}
                  {price === 0 && (
                    <span className="font-bold text-emerald-600">Free</span>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map(skill => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Match Reason */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <p className="text-[11px] font-bold text-emerald-700 truncate">
                    {getMatchLabel(mentor.matchScore)}
                    {mentor.matchBreakdown?.interest && mentor.matchBreakdown.interest >= 50
                      ? ' · Shares your interests'
                      : mentor.matchBreakdown?.affinity && mentor.matchBreakdown.affinity > 0
                        ? ' · Booked before'
                        : mentor.matchBreakdown?.quality && mentor.matchBreakdown.quality >= 60
                          ? ' · Highly rated'
                          : ' · Rising talent'
                    }
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
