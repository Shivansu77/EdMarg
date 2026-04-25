/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { Star, Search, User, Briefcase, ChevronRight, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { resolveApiBaseUrl } from '@/utils/api-base';


import { getImageUrl } from '@/utils/imageUrl';
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
    language?: string;
  };
};

const API_BASE_URL = resolveApiBaseUrl();

const DOMAIN_OPTIONS = [
  'All Domains',
  'Engineering',
  'Medical',
  'Business',
  'Design',
  'Government Jobs',
  'IT/Tech',
  'Engineering & Technology',
  'Medical & Healthcare',
  'Business & Entrepreneurship',
  'Creative & Design',
  'Government & Civil Services',
  'Research & Academia',
  'Skill-based & Vocational'
];

const RATING_OPTIONS = [
  { label: 'Any Rating', value: 0 },
  { label: '4.0+ Stars', value: 4.0 },
  { label: '4.5+ Stars', value: 4.5 },
  { label: '5.0 Stars', value: 5.0 }
];

function MentorsContent() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const LOAD_MORE_STEP = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMentors, setHasMoreMentors] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [careerDomain, setCareerDomain] = useState('All Domains');
  const [experienceMax, setExperienceMax] = useState(30);
  const [minRating, setMinRating] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  
  // Advanced Filter Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchMentorsPage = async (page: number, append = false) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/browsementor?page=${page}&limit=${LOAD_MORE_STEP}`,
      createAuthenticatedRequestInit({ method: 'GET' })
    );

    if (!response.ok) {
      throw new Error(`Failed to load mentors (${response.status})`);
    }

    const result = await response.json();
    const pageData: Mentor[] = Array.isArray(result?.data) ? result.data : [];

    setMentors((prev) => {
      if (!append) {
        return pageData;
      }

      const byId = new Map(prev.map((m) => [m._id, m]));
      for (const mentor of pageData) {
        byId.set(mentor._id, mentor);
      }
      return Array.from(byId.values());
    });

    if (typeof result?.pages === 'number') {
      setHasMoreMentors(page < result.pages);
    } else {
      setHasMoreMentors(pageData.length === LOAD_MORE_STEP);
    }
  };

  useEffect(() => {
    const fetchInitialMentors = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchMentorsPage(1, false);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch mentors right now.');
        setMentors([]);
        setFilteredMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMentors();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let filtered = mentors;

    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.mentorProfile?.expertise?.some(skill => skill.toLowerCase().includes(q)) ||
          m.mentorProfile?.bio?.toLowerCase().includes(q)
      );
    }

    // 2. Career Domain (approximated via expertise fields)
    if (careerDomain !== 'All Domains') {
      const domainLower = careerDomain.toLowerCase();
      filtered = filtered.filter(
        (m) => m.mentorProfile?.expertise?.some(skill => skill.toLowerCase().includes(domainLower))
      );
    }

    // 3. Experience Filter
    filtered = filtered.filter((m) => {
      const exp = m.mentorProfile?.experienceYears ?? 0;
      return exp <= experienceMax;
    });

    // 4. Rating Minimum Filter
    if (minRating > 0) {
       filtered = filtered.filter((m) => {
          const r = m.mentorProfile?.rating ?? 4.9; // Defaulting to 4.9 if missing to match previous UI polish
          return r >= minRating;
       });
    }

    // 5. Price Maximum Filter
    filtered = filtered.filter((m) => {
       const p = m.mentorProfile?.pricePerSession ?? 0;
       return p <= priceMax;
    });

    setFilteredMentors(filtered);
  }, [searchQuery, careerDomain, experienceMax, minRating, priceMax, mentors]);

  const shownMentors = filteredMentors;
  const canLoadMore = hasMoreMentors && !loadingMore;

  const clearFilters = () => {
    setSearchQuery('');
    setCareerDomain('All Domains');
    setExperienceMax(30);
    setMinRating(0);
    setPriceMax(10000);
  };

  const loadMoreMentors = async () => {
    if (!hasMoreMentors || loadingMore) return;
    const nextPage = currentPage + 1;

    try {
      setLoadingMore(true);
      await fetchMentorsPage(nextPage, true);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load more mentors.');
    } finally {
      setLoadingMore(false);
    }
  };

  const activeFilterCount = (careerDomain !== 'All Domains' ? 1 : 0) + (minRating > 0 ? 1 : 0) + (experienceMax < 30 ? 1 : 0) + (priceMax < 10000 ? 1 : 0);

  return (
    <DashboardLayout userName="Mentors">
      {/* Required CSS for custom Range Sliders */}
      <style dangerouslySetInnerHTML={{__html: `
        .h-range {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 4px;
          outline: none;
        }
        .h-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.1s;
        }
        .h-range::-webkit-slider-thumb:hover {
           transform: scale(1.1);
        }
      `}} />

      <div className="bg-white min-h-screen pb-16">
        
        {/* Sub-header Banner */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-[1500px] mx-auto px-6 sm:px-8 py-5 text-gray-500 text-[15px]">
            Connect with industry experts curated for your career goals.
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto px-6 sm:px-8 mt-8 space-y-6">
          
          {/* HORIZONTAL FILTER BAR */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-[12px] border border-gray-200 bg-white text-[15px] font-medium focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Domain */}
            <div className="relative w-full lg:w-[220px] group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                 <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </div>
              <select
                value={careerDomain}
                onChange={(e) => setCareerDomain(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-[12px] border border-gray-200 bg-white text-[15px] font-bold text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Rating */}
            <div className="relative w-full lg:w-[180px] group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                 <Star className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full pl-11 pr-10 py-3 rounded-[12px] border border-gray-200 bg-white text-[15px] font-bold text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
              >
                {RATING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced Toggle */}
            <div className="w-full lg:w-auto flex items-center justify-end lg:ml-auto">
               <button
                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                 className={`flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] border transition-all text-sm font-bold h-[46px] ${
                   showAdvancedFilters || activeFilterCount > 0
                   ? 'bg-black text-white border-black'
                   : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 <SlidersHorizontal size={16} />
                 Filters
                 {activeFilterCount > 0 && (
                   <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full ml-1">{activeFilterCount}</span>
                 )}
               </button>
            </div>
          </div>

          {/* Advanced Sliders Dropdown */}
          {showAdvancedFilters && (
            <div className="mt-5 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-8 animate-in slide-in-from-top-4 duration-200">
               {/* Experience Slider */}
               <div className="flex-1 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                     <label className="font-extrabold text-sm text-gray-900">Experience Cap</label>
                     <span className="text-xs font-black text-black bg-gray-200 px-2 py-1 rounded-md">Up to {experienceMax} yrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={experienceMax}
                    onChange={(e) => setExperienceMax(Number(e.target.value))}
                    className="h-range block"
                  />
               </div>

               {/* Price Slider */}
               <div className="flex-1 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                     <label className="font-extrabold text-sm text-gray-900">Maximum Price (₹)</label>
                     <span className="text-xs font-black text-black bg-gray-200 px-2 py-1 rounded-md">Max ₹{priceMax}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="h-range block"
                  />
               </div>

               {/* Active Filter Actions */}
               <div className="flex items-end justify-end flex-shrink-0">
                  <button
                     onClick={clearFilters}
                     disabled={activeFilterCount === 0 && !searchQuery}
                     className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                  >
                     <X size={16} /> Reset All
                  </button>
               </div>
            </div>
          )}

          {/* MAIN RESULTS AREA */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="font-bold text-red-900">Could not load mentors</p>
              <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {/* Results Count Header */}
              <div className="pt-2 text-gray-400 text-[15px]">
                Showing <span className="font-bold text-black">{shownMentors.length}</span> of <span className="font-bold text-black">{filteredMentors.length}</span> mentors
              </div>

              {filteredMentors.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-20 text-center mt-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ring-8 ring-gray-50/50">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-gray-900">No mentors match your search</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">Try adjusting your Domain, Price, or Experience filters to find more available experts.</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-8 px-6 py-2.5 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {shownMentors.map((mentor, index) => {
                      const tags = mentor.mentorProfile?.expertise?.slice(0, 3) || [];
                      const rating = mentor.mentorProfile?.rating ?? 0;
                      const bio = mentor.mentorProfile?.bio || 'Career mentor available for personalized sessions.';
                      const experience = mentor.mentorProfile?.experienceYears ?? 0;
                      const price = mentor.mentorProfile?.pricePerSession;

                      return (
                        <div
                          key={mentor._id}
                          className="rounded-[20px] border border-gray-200 bg-white flex flex-col overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                        >
                          <div className="relative h-56 bg-[#f4f6f8] border-b border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {mentor.profileImage ? (
                              <Image
                                src={getImageUrl(mentor.profileImage, mentor.name)}
                                alt={mentor.name}
                                fill
                                priority={index < 6}
                                sizes="(max-width: 1024px) 100vw, 25vw"
                                className="object-cover object-top hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-[120px] font-black text-[#0f172a] tracking-tight uppercase select-none">
                                {mentor.name.slice(0, 2)}
                              </span>
                            )}
                            {rating > 0 && (
                              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100 flex items-center gap-1.5 z-10">
                                <Star size={14} className="fill-emerald-500 text-emerald-500" />
                                <span className="text-sm font-bold text-gray-900">{Number(rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="mb-4">
                              <h3 className="text-2xl font-bold text-black truncate">
                                {mentor.name}
                              </h3>
                              <p className="text-[15px] text-gray-500 mt-1">
                                {experience > 0
                                  ? `${experience} ${experience === 1 ? 'yr' : 'yrs'} of experience`
                                  : 'Industry Expert'}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <span
                                    key={`${mentor._id}-${tag}`}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700"
                                    title={tag}
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700">
                                  General
                                </span>
                              )}
                            </div>

                            <p className="text-[15px] text-gray-600 line-clamp-2 mb-6 flex-1 pr-4">{bio}</p>

                            <div className="mt-auto pt-5 border-t border-gray-100">
                              <div className="mb-4">
                                <p className="text-sm text-gray-400">Starting from</p>
                                <p className="text-xl font-bold text-black mt-0.5">
                                  {price ? `₹${price}` : 'Free'}
                                  <span className="text-sm font-normal text-gray-500">/session</span>
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <Link href={`/student/mentors/${mentor._id}`} className="flex-1">
                                  <button className="w-full text-center py-3 bg-white text-gray-700 font-bold rounded-xl text-[15px] border border-gray-200 transition-colors hover:bg-gray-50 hover:border-gray-300">
                                    View Profile
                                  </button>
                                </Link>
                                <Link href={isLoggedIn ? `/student/booking?id=${mentor._id}` : '/login'} className="flex-1">
                                  <button className="w-full text-center py-3 bg-black text-white font-bold rounded-xl text-[15px] transition-colors hover:bg-gray-800 border border-black shadow-sm">
                                    {isLoggedIn ? 'Connect' : 'Sign in'}
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Browse more mentors */}
                  <div className="flex items-center justify-center mt-12 py-6">
                    <button
                      onClick={loadMoreMentors}
                      disabled={!canLoadMore}
                      className="px-7 py-3 rounded-xl text-[15px] font-bold shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      {loadingMore
                        ? 'Loading more...'
                        : canLoadMore
                          ? `Browse more mentors (+${LOAD_MORE_STEP})`
                          : 'Browse more mentors (No more)'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MentorsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <Suspense fallback={<div>Loading filters...</div>}>
        <MentorsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
