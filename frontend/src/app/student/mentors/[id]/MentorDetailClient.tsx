/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Briefcase, Clock, Calendar, ArrowLeft, CheckCircle, Award, Users, TrendingUp, Globe, MessageSquare, ChevronLeft, CalendarDays } from 'lucide-react';


import { getImageUrl } from '@/utils/imageUrl';
import { resolveApiBaseUrl } from '@/utils/api-base';

const API_BASE_URL = resolveApiBaseUrl();

type Review = {
  _id: string;
  student: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

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
    sessionDuration?: number;
    totalSessions?: number;
    language?: string;
  };
};

export default function MentorDetailClient({ mentor }: { mentor: Mentor }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);

        const reviewsResponse = await fetch(`${API_BASE_URL}/api/v1/reviews/mentor/${mentor._id}?limit=50`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          if (reviewsData.success && reviewsData.data?.reviews) {
            setReviews(reviewsData.data.reviews);
          }
        }

        const statsResponse = await fetch(`${API_BASE_URL}/api/v1/reviews/mentor/${mentor._id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.data) {
            setReviewStats(statsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [mentor._id]);

  const {
    expertise = [],
    bio = 'Experienced mentor ready to guide you on your journey.',
    experienceYears = 0,
    pricePerSession = 0,
    rating: mentorRating = 0,
    sessionDuration = 45,
    totalSessions = 0,
    language = 'English, Hindi',
  } = mentor.mentorProfile || {};

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const effectiveRating = reviewStats?.averageRating ?? mentorRating ?? 0;
  const reviewCount = reviewStats?.totalReviews ?? reviews.length;
  const sessionCount = Math.max(totalSessions, reviewCount);
  const distributionSource = reviewStats?.ratingDistribution ?? reviewStats?.distribution;
  const latestReview = reviews[0];
  const recommendationCount = (distributionSource?.[5] || 0) + (distributionSource?.[4] || 0);
  const recommendationRate = reviewCount > 0 ? Math.round((recommendationCount / reviewCount) * 100) : 0;
  const expertiseHighlights = expertise.slice(0, 4);
  const reviewActionHref = isLoggedIn ? '/student/history' : `/login?redirect=/student/history`;
  const trustPoints = [
    `${sessionDuration} min focused session`,
    experienceYears > 0 ? `${experienceYears}+ years of guidance` : 'Practical guidance for students',
    reviewCount > 0 ? `${reviewCount} verified student reviews` : 'New mentor profile',
    language ? `Sessions in ${language}` : 'Comfortable communication support',
  ];

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
          />
        ))}
      </div>
    );
  };

  const ratingDistribution = distributionSource
    ? [
      { stars: 5, count: distributionSource[5] || 0, percentage: reviewCount > 0 ? Math.round(((distributionSource[5] || 0) / reviewCount) * 100) : 0 },
      { stars: 4, count: distributionSource[4] || 0, percentage: reviewCount > 0 ? Math.round(((distributionSource[4] || 0) / reviewCount) * 100) : 0 },
      { stars: 3, count: distributionSource[3] || 0, percentage: reviewCount > 0 ? Math.round(((distributionSource[3] || 0) / reviewCount) * 100) : 0 },
      { stars: 2, count: distributionSource[2] || 0, percentage: reviewCount > 0 ? Math.round(((distributionSource[2] || 0) / reviewCount) * 100) : 0 },
      { stars: 1, count: distributionSource[1] || 0, percentage: reviewCount > 0 ? Math.round(((distributionSource[1] || 0) / reviewCount) * 100) : 0 },
    ]
    : [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pb-20">
      {/* Top Nav Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-6 border-b border-transparent">
        <Link href="/student/mentors" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Back to Mentors
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          {/* Main Content Area */}
          <div className="space-y-12">

            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm relative">
                <Image
                  src={getImageUrl(mentor.profileImage, mentor.name)}
                  alt={mentor.name}
                  width={128}
                  height={128}
                  className="object-cover object-top w-full h-full"
                />
              </div>
              <div className="pt-2">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2">{mentor.name}</h1>
                <p className="text-lg text-slate-600 mb-4 font-medium">
                  {expertise[0] || 'Professional Mentor'}
                </p>
                <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Star className="fill-amber-400 text-amber-400" size={16} />
                    <span className="text-slate-900 font-semibold">{effectiveRating.toFixed(1)}</span>
                    <span className="text-slate-500">({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                    <Briefcase size={14} />
                    <span>{experienceYears > 0 ? `${experienceYears}+ yrs exp` : 'Expert Guide'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                    <Globe size={14} />
                    <span>{language}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Student satisfaction</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{reviewCount > 0 ? `${effectiveRating.toFixed(1)}/5` : 'New'}</p>
                    <p className="mt-1 text-sm text-slate-500">{reviewCount > 0 ? `${recommendationRate}% of students rated 4 stars or above` : 'Be among the first students to review'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sessions supported</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{sessionCount > 0 ? sessionCount : 'Flexible'}</p>
                    <p className="mt-1 text-sm text-slate-500">{sessionDuration}-minute mentorship conversations</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Best for</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{expertise[0] || 'Career guidance'}</p>
                    <p className="mt-1 text-sm text-slate-500">{language} sessions available</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* About Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-slate-900">About</h2>
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <p className="text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                  {bio}
                </p>
              </div>
            </section>

            {/* Expertise Section */}
            {expertise.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-medium shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {expertiseHighlights.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Popular For</h2>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <div className="flex flex-wrap gap-3">
                    {expertiseHighlights.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-100"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <hr className="border-slate-200" />

            {/* Reviews Section */}
            <section>
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
                  Student Reviews
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium ml-2">{reviewCount}</span>
                </h2>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 shadow-[0_2px_8px_rgb(0,0,0,0.02)] lg:max-w-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-amber-100">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">Want to leave a rating?</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Students can submit stars and written feedback after a completed mentorship session.
                      </p>
                      <Link
                        href={reviewActionHref}
                        className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        {isLoggedIn ? 'Open session history' : 'Sign in to review later'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {loadingReviews ? (
                <div className="h-32 flex items-center justify-center bg-white border border-slate-200 rounded-2xl">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent align-[-0.125em]"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <MessageSquare size={20} className="text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-medium mb-1">No reviews yet</h3>
                  <p className="text-slate-500 text-sm">This mentor is new and hasn't received reviews yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-[0_2px_8px_rgb(0,0,0,0.02)] rounded-2xl p-6 sm:p-8">
                  {/* Rating summary */}
                  <div className="flex flex-col sm:flex-row gap-8 items-center mb-10 pb-8 border-b border-slate-100">
                    <div className="text-center sm:text-left flex flex-col items-center sm:items-start shrink-0">
                      <div className="text-5xl font-bold tracking-tight text-slate-900 mb-2">{effectiveRating.toFixed(1)}</div>
                      <div className="mb-2">{renderStars(Math.round(effectiveRating), 20)}</div>
                      <p className="text-sm font-medium text-slate-500">Based on {reviewCount} reviews</p>
                    </div>

                    <div className="flex-1 w-full max-w-sm space-y-2">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-slate-600 w-3">{item.stars}</span>
                          <Star size={12} className="text-slate-400 fill-slate-400 shrink-0" />
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden mx-1">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-500 w-8 text-right font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 border border-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recommended</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{recommendationRate}%</p>
                      <p className="mt-1 text-sm text-slate-500">Students gave 4 or 5 stars</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 border border-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Verified feedback</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{reviewCount}</p>
                      <p className="mt-1 text-sm text-slate-500">Reviews from completed sessions</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-4 border border-slate-100">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Latest review</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">
                        {latestReview
                          ? new Date(latestReview.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Awaiting first review'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">Fresh feedback from recent students</p>
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-8">
                    {displayedReviews.map((review) => (
                      <div key={review._id} className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                        <div className="flex items-start gap-4">
                          <Image
                            src={getImageUrl(review.student.profileImage, review.student.name)}
                            alt={review.student.name}
                            width={40}
                            height={40}
                            className="rounded-full border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-slate-900 text-sm truncate pr-2">{review.student.name}</h4>
                              <span className="text-xs text-slate-500 shrink-0 bg-slate-50 px-2 py-1 rounded-md">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                              {renderStars(review.rating, 14)}
                              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                                {review.rating}.0 rating
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                Verified session
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <div className="mt-8 pt-4 text-center sm:text-left">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
                      >
                        {showAllReviews ? 'Show fewer reviews' : `View all ${reviews.length} reviews`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar - Sticky Booking Card */}
          <div className="lg:sticky lg:top-8 mt-8 lg:mt-0 space-y-6">

            {/* Booking Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 border-x border-slate-900"></div>

              <div className="mb-6 mt-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Session investment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    {pricePerSession ? `₹${pricePerSession}` : 'Free'}
                  </span>
                  <span className="text-slate-500 font-medium">/ session</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <Clock size={16} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium">{sessionDuration} minutes duration</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <CalendarDays size={16} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium">Flexible scheduling</span>
                </div>
              </div>

              <Link href={isLoggedIn ? `/student/booking?id=${mentor._id}` : `/login?redirect=/student/booking?id=${mentor._id}`} className="block">
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl text-sm font-semibold shadow-md shadow-slate-900/10 transition-all focus:ring-4 focus:ring-slate-900/10 flex items-center justify-center gap-2">
                  {isLoggedIn ? 'Book a Session' : 'Sign in to Book'}
                </button>
              </Link>
              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                No charges until confirmed
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Why students choose {mentor.name}</h3>
              <ul className="space-y-3">
                {trustPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Award size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Value Proposition Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">What's included</h3>
              <ul className="space-y-4">
                {[
                  '1:1 personalized video call',
                  'Actionable feedback',
                  'Direct message access',
                  'Career pathway guidance'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-slate-300 shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
