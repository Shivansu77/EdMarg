'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Star, Search, X, User, Briefcase, Award } from 'lucide-react';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function MentorsContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/users/browsementor`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

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
    <DashboardLayout userName="Mentors">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Mentor</h1>
          <p className="text-gray-600">Connect with industry experts curated for your career goals.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-600">Loading mentors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-900">Could not load mentors</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="space-y-5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, skill, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Skills Filter */}
              {allSkills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Filter by Skills</p>
                    {selectedSkills.length > 0 && (
                      <button
                        onClick={() => setSelectedSkills([])}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <div
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-medium border border-gray-300"
                    >
                      {skill}
                      <button
                        onClick={() => toggleSkill(skill)}
                        className="hover:text-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Count */}
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{paginatedMentors.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredMentors.length}</span> mentors
              </p>
            </div>

            {filteredMentors.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <div className="inline-block p-3 bg-gray-100 rounded-lg mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">No mentors found</p>
                <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                {/* Mentor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMentors.map((mentor) => {
                    const tags = mentor.mentorProfile?.expertise?.slice(0, 2) || [];
                    const rating = mentor.mentorProfile?.rating ?? 0;
                    const bio = mentor.mentorProfile?.bio || 'Career mentor available for personalized sessions.';
                    const experience = mentor.mentorProfile?.experienceYears ?? 0;
                    const price = mentor.mentorProfile?.pricePerSession;
                    const hasImage = mentor.profileImage && mentor.profileImage.trim() !== '';

                    return (
                      <div
                        key={mentor._id}
                        className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Image Section */}
                        {hasImage ? (
                          <div className="h-48 bg-gray-100 overflow-hidden">
                            <img
                              src={mentor.profileImage}
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
                          </div>
                        )}

                        {/* Content Section */}
                        <div className="p-6 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{mentor.name}</h3>
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <Briefcase size={14} />
                                {experience} {experience === 1 ? 'year' : 'years'} experience
                              </p>
                            </div>
                            {rating > 0 && (
                              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900">{Number(rating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          <p className="text-sm text-gray-600 line-clamp-2">{bio}</p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2">
                            {tags.length > 0 ? (
                              tags.map((tag) => (
                                <span
                                  key={`${mentor._id}-${tag}`}
                                  className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                General
                              </span>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gray-200" />

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Session Rate</p>
                              <p className="text-base font-semibold text-gray-900 mt-1">
                                {price ? `$${price}` : 'Contact'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 font-medium">Duration</p>
                              <p className="text-base font-semibold text-gray-900 mt-1">45 min</p>
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="flex gap-3 pt-2">
                            <Link href={`/student/mentors/${mentor._id}`} className="flex-1">
                              <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                                View Profile
                              </button>
                            </Link>
                            <Link href={localStorage.getItem('token') ? `/student/booking?id=${mentor._id}` : '/login'} className="flex-1">
                              <button className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
                                {localStorage.getItem('token') ? 'Connect' : 'Sign in'}
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
                  <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
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
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-gray-900 text-white'
                                : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
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
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
