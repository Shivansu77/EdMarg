'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { Star, Search, User, Briefcase, ChevronRight, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [careerDomain, setCareerDomain] = useState('All Domains');
  const [experienceMax, setExperienceMax] = useState(30);
  const [minRating, setMinRating] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  
  // Advanced Filter Toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/browsementor`,
          createAuthenticatedRequestInit({ method: 'GET' })
        );

        if (!response.ok) {
          throw new Error(`Failed to load mentors (${response.status})`);
        }

        const result = await response.json();
        setMentors(Array.isArray(result?.data) ? result.data : []);
        setFilteredMentors(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch mentors right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
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
    setCurrentPage(1);
  }, [searchQuery, careerDomain, experienceMax, minRating, priceMax, mentors]);

  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);

  const clearFilters = () => {
    setSearchQuery('');
    setCareerDomain('All Domains');
    setExperienceMax(30);
    setMinRating(0);
    setPriceMax(10000);
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
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.1s;
        }
        .h-range::-webkit-slider-thumb:hover {
           transform: scale(1.1);
        }
      `}} />

      <div className="space-y-8 pb-16 bg-gray-50/50 min-h-screen">
        
        {/* Dynamic Header */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/40 px-6 pb-12 pt-10 sm:px-8">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-100/40 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10 max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500/80 mb-2">Mentor Directory</p>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Connect with Industry Experts</h1>
              <p className="mt-3 text-lg text-gray-600/90 leading-relaxed tracking-wide">
                Build your perfect career trajectory by learning directly from professionals exactly where you want to be.
              </p>
            </div>
        </div>

        <div className="px-6 sm:px-8 max-w-[1500px] mx-auto space-y-8">
          
          {/* HORIZONTAL FILTER BAR */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 relative z-20">
             
             {/* Primary Row */}
             <div className="flex flex-col lg:flex-row gap-4 items-center">
                
                {/* Search */}
                <div className="relative w-full lg:w-[40%]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all outline-none"
                  />
                </div>

                {/* Domain */}
                <div className="relative w-full lg:w-[25%] group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <select
                    value={careerDomain}
                    onChange={(e) => setCareerDomain(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                  >
                    {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Rating */}
                <div className="relative w-full lg:w-[20%] group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                     <Star className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                  >
                    {RATING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Advanced Toggle */}
                <div className="w-full lg:w-auto flex items-center justify-end lg:ml-auto">
                   <button
                     onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                     className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                       showAdvancedFilters || activeFilterCount > 0
                       ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                       : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                     }`}
                   >
                     <SlidersHorizontal size={16} />
                     Filters
                     {activeFilterCount > 0 && (
                       <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{activeFilterCount}</span>
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
                        <span className="text-xs font-black text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">Up to {experienceMax} yrs</span>
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
                        <span className="text-xs font-black text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">Max ₹{priceMax}</span>
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
          </div>

          {/* MAIN RESULTS AREA */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="inline-block relative">
                   <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
                   <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest">Loading mentors...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="font-bold text-red-900">Could not load mentors</p>
              <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {/* Results Count Header */}
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-gray-500 font-medium text-sm">
                  Showing <span className="font-black text-gray-900">{paginatedMentors.length}</span> of <span className="font-black text-gray-900">{filteredMentors.length}</span> mentors
                </div>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-20 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ring-8 ring-gray-50/50">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-gray-900">No mentors match your search</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500 max-w-sm mx-auto">Try adjusting your Domain, Price, or Experience filters to find more available experts.</p>
                  <button 
                    onClick={clearFilters}
                    className="mt-8 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedMentors.map((mentor) => {
                      const tags = mentor.mentorProfile?.expertise?.slice(0, 3) || [];
                      const rating = mentor.mentorProfile?.rating ?? 4.9;
                      const bio = mentor.mentorProfile?.bio || 'Career mentor available for highly personalized growth sessions.';
                      const experience = mentor.mentorProfile?.experienceYears ?? 0;
                      const price = mentor.mentorProfile?.pricePerSession;
                      const hasImage = mentor.profileImage && mentor.profileImage.trim() !== '';

                      return (
                        <div
                          key={mentor._id}
                          className="group flex flex-col rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Image Header with Gradient Overlay */}
                          <div className="relative h-44 bg-gray-100 overflow-hidden">
                             {hasImage ? (
                              <img
                                src={mentor.profileImage}
                                alt={mentor.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                                <User className="w-16 h-16 text-indigo-300/50" strokeWidth={1.5} />
                              </div>
                            )}
                            
                            {/* Absolute Rating Badge */}
                            {rating > 0 && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm">
                                <Star size={14} className="fill-amber-400 text-amber-500" />
                                <span className="text-xs font-black text-gray-900">{Number(rating).toFixed(1)}</span>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                            
                            {/* Name & Title over image */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-xl font-black text-white tracking-tight truncate drop-shadow-md">{mentor.name}</h3>
                                <p className="text-xs font-bold text-white/90 flex items-center gap-1.5 mt-1 drop-shadow-md">
                                  <Briefcase size={12} className="opacity-80"/>
                                  {experience > 0 ? `${experience} ${experience === 1 ? 'yr' : 'yrs'} exp` : 'Industry Expert'}
                                </p>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="flex flex-col flex-1 p-6">
                            <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed flex-1">
                              &quot;{bio}&quot;
                            </p>

                            {/* Tags */}
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <span
                                    key={`${mentor._id}-${tag}`}
                                    className="inline-block rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 truncate max-w-[120px]"
                                    title={tag}
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-block rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500">
                                  General
                                </span>
                              )}
                            </div>

                            <div className="h-px bg-gray-100 my-5" />

                            {/* Footer Pricing & Actions */}
                            <div className="flex items-center justify-between mb-5">
                               <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rate</p>
                                  <p className="text-lg font-black text-gray-900 tracking-tighter mt-0.5">
                                    {price ? `₹${price}` : 'Free'}
                                  </p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Length</p>
                                  <p className="text-sm font-bold text-gray-600 mt-0.5">45 min</p>
                               </div>
                            </div>
                            
                            <div className="flex gap-2.5 mt-auto">
                              <Link href={`/student/mentors/${mentor._id}`} className="flex-[0.4]">
                                <button className="w-full rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 p-2.5 flex justify-center items-center transition-all group-btn group-hover:bg-indigo-50 group-hover:border-indigo-100">
                                  <User size={18} className="text-gray-600 group-hover:text-indigo-600" />
                                </button>
                              </Link>
                              <Link href={isLoggedIn ? `/student/booking?id=${mentor._id}` : '/login'} className="flex-[0.6]">
                                <button className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-black hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/25">
                                  {isLoggedIn ? 'Book' : 'Sign in'} <ChevronRight size={16} />
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-12 py-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow transition-all"
                      >
                        Prev
                      </button>
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          
                          const isActive = currentPage === page;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold shadow-sm flex-shrink-0 transition-all ${
                                isActive
                                  ? 'bg-gray-900 text-white border-transparent'
                                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
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
      <MentorsContent />
    </ProtectedRoute>
  );
}
