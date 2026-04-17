'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Search, X } from 'lucide-react';
import Image from 'next/image';


import { getImageUrl } from '@/utils/imageUrl';
import { resolveApiBaseUrl } from '@/utils/api-base';
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

export default function BrowseMentorsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/browsementor`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load mentors (${response.status})`);
        }

        const result = await response.json();

        const mentorData = Array.isArray(result?.data) ? result.data : [];

        setMentors(mentorData);
        setFilteredMentors(mentorData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch mentors right now.');
        setMentors([]);
        setFilteredMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const allSkills = Array.from(
    new Set(mentors.flatMap((m) => m.mentorProfile?.expertise || []))
  ).sort();

  useEffect(() => {
    let filtered = mentors;

    if (searchQuery) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.mentorProfile?.expertise?.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          mentor.mentorProfile?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((mentor) =>
        selectedSkills.some((skill) =>
          mentor.mentorProfile?.expertise?.includes(skill)
        )
      );
    }

    setFilteredMentors(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedSkills, mentors]);

  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-green-50/40 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-[0_10px_40px_rgba(5,150,105,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Find Your Mentor</h1>
              <p className="text-slate-600 mt-2">Connect with industry experts curated for your career goals</p>
            </div>
            <Link href="/" className="text-slate-600 hover:text-slate-900 font-semibold text-sm">
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading mentors...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, skill, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-emerald-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm hover:border-emerald-300 transition-all"
                />
              </div>

              {/* Skills Filter */}
              {allSkills.length > 0 && (
                <div className="space-y-4 bg-white rounded-xl p-6 shadow-[0_8px_24px_rgba(5,150,105,0.08)] border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Filter by Skills</p>
                      <p className="text-xs text-slate-600 mt-1">Select one or more skills to narrow down</p>
                    </div>
                    {selectedSkills.length > 0 && (
                      <button
                        onClick={() => setSelectedSkills([])}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.3)]'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-semibold text-slate-700">Active filters:</span>
                  {selectedSkills.map((skill) => (
                    <div
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold border border-emerald-200 shadow-sm"
                    >
                      {skill}
                      <button
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-emerald-600 ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  <span className="text-slate-900 font-bold">{paginatedMentors.length}</span> of <span className="text-slate-900 font-bold">{filteredMentors.length}</span> mentors
                </p>
              </div>

              {filteredMentors.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-white p-12 text-center shadow-sm">
                  <div className="inline-block p-3 bg-emerald-50 rounded-full mb-4">
                    <Search className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    {error ? 'Unable to load mentors from the backend' : 'No mentors found matching your criteria'}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    {error ? 'Check that the backend is running and reachable from the frontend.' : 'Try adjusting your filters or search terms'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mentor Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedMentors.map((mentor) => {
                      const tags = mentor.mentorProfile?.expertise?.slice(0, 3) || [];
                      const rating = mentor.mentorProfile?.rating ?? 0;
                      const bio = mentor.mentorProfile?.bio || 'Career mentor available for personalized sessions.';
                      const experience = mentor.mentorProfile?.experienceYears ?? 0;
                      const price = mentor.mentorProfile?.pricePerSession ?? 0;

                      return (
                        <div
                          key={mentor._id}
                          className="group rounded-2xl border border-emerald-100 bg-white overflow-hidden hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col"
                        >
                          {/* Image Section with Overlay */}
                          <div className="relative h-48 bg-linear-to-br from-gray-700 via-gray-800 to-black overflow-hidden">
                            <Image
                              src={getImageUrl(mentor.profileImage, mentor.name)}
                              alt={mentor.name}
                              fill
                              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* Rating Badge */}
                            {rating > 0 && (
                              <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-900">{Number(rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="p-5 flex flex-col flex-1">
                            {/* Name and Experience */}
                            <div className="mb-3">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{mentor.name}</h3>
                              <p className="text-xs text-slate-600 font-medium mt-1">
                                {experience > 0 ? `${experience} ${experience === 1 ? 'year' : 'years'} of experience` : 'Industry Expert'}
                              </p>
                            </div>

                            {/* Skills Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {tags.length > 0 ? (
                                tags.map((tag) => (
                                  <span
                                    key={`${mentor._id}-${tag}`}
                                    className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                                  General
                                </span>
                              )}
                            </div>

                            {/* Bio */}
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{bio}</p>

                            {/* Price Section */}
                            <div className="border-t border-emerald-100 pt-4 mb-4">
                              <p className="text-xs text-slate-600 font-medium mb-1">Starting from</p>
                              <p className="text-xl font-bold text-slate-900">
                                {price > 0 ? `₹${price}` : "Free"}
                                {price > 0 && <span className="text-sm font-medium text-slate-600">/session</span>}
                              </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                              <Link href={`/browse-mentors/${mentor._id}`} className="flex-1">
                                <button className="w-full rounded-lg bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all duration-200 border border-emerald-200">
                                  View Profile
                                </button>
                              </Link>
                              <Link href={isLoggedIn ? `/student/booking?id=${mentor._id}` : '/login'} className="flex-1">
                                <button className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 shadow-[0_10px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)]">
                                  {isLoggedIn ? 'Connect' : 'Sign in'}
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
                    <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-emerald-100">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2.5 rounded-lg border border-emerald-200 bg-white text-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-all"
                      >
                        ← Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2.5 rounded-lg font-semibold transition-all ${
                                currentPage === page
                                  ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]'
                                  : 'border border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50'
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
                        className="px-4 py-2.5 rounded-lg border border-emerald-200 bg-white text-slate-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-all"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
