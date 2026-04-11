'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Star, MapPin, Clock, MessageCircle, Calendar, Share2, Heart, ChevronLeft, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { resolveApiBaseUrl } from '@/utils/api-base';

import { getImageUrl } from '@/utils/imageUrl';

type Mentor = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    rating?: number;
  };
};

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
};

const API_BASE_URL = resolveApiBaseUrl();

function MentorProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mentorId = searchParams.get('id');
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      text: 'Excellent mentor! Very knowledgeable and patient. Helped me prepare for my interviews and land my dream job.',
      date: '2 weeks ago',
      avatar: 'https://ui-avatars.com/api/?background=4e45e2&color=ffffff&name=SJ&size=40',
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 5,
      text: 'Great insights on product management. The mentor provided actionable feedback on my portfolio.',
      date: '1 month ago',
      avatar: 'https://ui-avatars.com/api/?background=4e45e2&color=ffffff&name=MC&size=40',
    },
    {
      id: '3',
      author: 'Emily Rodriguez',
      rating: 4,
      text: 'Very helpful and responsive. Would recommend for career guidance.',
      date: '2 months ago',
      avatar: 'https://ui-avatars.com/api/?background=4e45e2&color=ffffff&name=ER&size=40',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/browsementor`,
          createAuthenticatedRequestInit({
            method: 'GET',
          })
        );
        if (!response.ok) throw new Error('Failed to fetch mentors');

        const result = await response.json();
        const mentorData = result.data?.find((m: Mentor) => m._id === mentorId);
        
        if (!mentorData) {
          setError('Mentor not found');
        } else {
          setMentor(mentorData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch mentor');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading mentor profile...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Mentor not found'}</p>
          <Link href="/student/mentors" className="text-blue-600 hover:underline">
            Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  const rating = mentor.mentorProfile?.rating ?? 0;
  const expertise = mentor.mentorProfile?.expertise ?? [];
  const bio = mentor.mentorProfile?.bio || 'Experienced mentor ready to help you grow.';
  const experience = mentor.mentorProfile?.experienceYears ?? 0;
  const price = mentor.mentorProfile?.pricePerSession ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/student/mentors" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Add to favorites"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Share">
              <Share2 size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-40 lg:h-48 bg-gradient-to-br from-gray-900 to-gray-700" />
              <div className="px-6 lg:px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-20 mb-6">
                  <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-4 border-white overflow-hidden shadow-sm bg-gray-50 flex-shrink-0">
                    <Image
                      src={getImageUrl(mentor.profileImage, mentor.name)}
                      alt={mentor.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{mentor.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                        <span className="text-gray-600 text-sm">(82 reviews)</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 font-medium">{experience > 0 ? `${experience}+ years` : "Industry Expert"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="border-b border-gray-200 flex overflow-x-auto">
                {['about', 'expertise', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-semibold text-sm lg:text-base whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6 lg:p-8">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                      <p className="text-gray-700 leading-relaxed text-base">{bio}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What I Offer</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">✓</span>
                          <span className="text-base">1-on-1 mentoring sessions tailored to your goals</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">✓</span>
                          <span className="text-base">Career guidance and professional development</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">✓</span>
                          <span className="text-base">Resume and portfolio review</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">✓</span>
                          <span className="text-base">Interview preparation and mock interviews</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Availability</h3>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock size={20} className="text-gray-600 flex-shrink-0" />
                        <span className="text-base">Available for sessions Monday to Friday, 9 AM - 6 PM EST</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expertise Tab */}
                {activeTab === 'expertise' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-3">
                        {expertise.length > 0 ? (
                          expertise.map((skill) => (
                            <span
                              key={skill}
                              className="px-4 py-2 rounded-full bg-gray-100 text-gray-900 font-medium text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600">No expertise listed</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Experience Highlights</h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">•</span>
                          <span className="text-base">{experience > 0 ? `${experience}+ years` : "Industry Expert"}</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">•</span>
                          <span className="text-base">Mentored 100+ professionals</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-gray-900 font-bold mt-0.5">•</span>
                          <span className="text-base">Helped mentees land roles at top companies</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6 pb-8 border-b border-gray-200">
                      <div>
                        <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Based on 82 reviews</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-start gap-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={review.avatar}
                              alt={review.author}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{review.author}</h4>
                                <span className="text-sm text-gray-600 flex-shrink-0">{review.date}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700 text-base">{review.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 sticky top-24 space-y-6">
              <div>
                <p className="text-sm text-gray-600 font-medium">Starting from</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{price > 0 ? `₹${price}` : "Free"}</p>
                <p className="text-sm text-gray-600 mt-1">/session</p>
              </div>

              <Link
                href={`/student/booking?id=${mentor._id}`}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Book a Session
              </Link>

              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={18} />
                Send Message
              </button>

              {/* Quick Info */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Response time</p>
                    <p className="text-sm text-gray-600 mt-1">Usually within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Star size={20} className="text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Rating</p>
                    <p className="text-sm text-gray-600 mt-1">{rating.toFixed(1)} from 82 reviews</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Location</p>
                    <p className="text-sm text-gray-600 mt-1">Available worldwide</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-6 border-t border-gray-200 space-y-3 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Email:</span> <br className="hidden sm:block" />{mentor.email}
                </p>
                {mentor.phoneNumber && (
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Phone:</span> <br className="hidden sm:block" />{mentor.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentorProfilePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-600">Loading mentor profile...</p>
          </div>
        }
      >
        <MentorProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
