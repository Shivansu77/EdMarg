'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Globe,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

type ReviewDistribution = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: ReviewDistribution;
  distribution?: ReviewDistribution;
};

export type Mentor = {
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
    languages?: string[];
    currentCompany?: string;
    currentTitle?: string;
    location?: string;
  };
};

type MentorDetailClientProps = {
  mentor: Mentor;
  variant?: 'student' | 'public';
};

const formatPrice = (price: number) => {
  if (!price || price <= 0) return 'Free';
  return `₹${price}`;
};

const formatReviewDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

const getRatingPercentage = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

export default function MentorDetailClient({
  mentor,
  variant = 'public',
}: MentorDetailClientProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(window.localStorage.getItem('token')));
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

    void fetchReviews();
  }, [mentor._id]);

  const mentorProfile = mentor.mentorProfile || {};
  const expertise = (mentorProfile.expertise || []).map((item) => item.trim()).filter(Boolean);
  const bio = mentorProfile.bio?.trim() || 'Experienced mentor ready to guide you with practical next steps.';
  const experienceYears = mentorProfile.experienceYears || 0;
  const pricePerSession = mentorProfile.pricePerSession || 0;
  const mentorRating = mentorProfile.rating || 0;
  const sessionDuration = mentorProfile.sessionDuration || 45;
  const totalSessions = mentorProfile.totalSessions || 0;
  const currentCompany = mentorProfile.currentCompany?.trim() || '';
  const currentTitle = mentorProfile.currentTitle?.trim() || '';
  const location = mentorProfile.location?.trim() || '';

  const languages = useMemo(() => {
    const explicitLanguages = (mentorProfile.languages || []).map((item) => item.trim()).filter(Boolean);
    if (explicitLanguages.length > 0) return explicitLanguages;
    return (mentorProfile.language || 'English, Hindi')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }, [mentorProfile.language, mentorProfile.languages]);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const effectiveRating = reviewStats?.averageRating ?? mentorRating ?? 0;
  const reviewCount = reviewStats?.totalReviews ?? reviews.length;
  const sessionCount = Math.max(totalSessions, reviewCount);
  const distributionSource = reviewStats?.ratingDistribution ?? reviewStats?.distribution ?? null;
  const recommendationCount = (distributionSource?.[5] || 0) + (distributionSource?.[4] || 0);
  const recommendationRate = reviewCount > 0 ? Math.round((recommendationCount / reviewCount) * 100) : 0;
  
  const bookingHref = isLoggedIn
    ? `/student/booking?id=${mentor._id}`
    : `/login?redirect=${encodeURIComponent(`/student/booking?id=${mentor._id}`)}`;
  const backHref = variant === 'student' ? '/student/mentors' : '/browse-mentors';
  
  const headlineRole = currentTitle && currentCompany
      ? `${currentTitle} @ ${currentCompany}`
      : currentTitle || currentCompany || (expertise[0] ? `${expertise[0]} Expert` : 'Professional Mentor');

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: distributionSource?.[stars as keyof ReviewDistribution] || 0,
    percentage: getRatingPercentage(distributionSource?.[stars as keyof ReviewDistribution] || 0, reviewCount),
  }));

  const content = (
    <div className={`mx-auto max-w-[1200px] w-full ${variant === 'student' ? 'pt-4' : 'pt-10'} pb-24`}>
      {/* Back Button */}
      <div className="mb-6 px-4 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to mentors
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-8">
        
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 space-y-8">
          
          {/* ── Header Profile Card ── */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100">
                  <AppImage
                    src={getImageUrl(mentor.profileImage, mentor.name, 400)}
                    alt={mentor.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
              </div>

              {/* Identity Info */}
              <div className="flex-1 min-w-0 pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight truncate">
                    {mentor.name}
                  </h1>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                </div>
                
                <h2 className="text-lg sm:text-xl font-medium text-slate-600 mb-4 line-clamp-2">
                  {headlineRole}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                  {effectiveRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{effectiveRating.toFixed(1)}</span>
                      <span>({reviewCount} reviews)</span>
                    </div>
                  )}
                  {experienceYears > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span>{experienceYears}+ Years Exp.</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span>{languages.slice(0,2).join(', ')}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-3">About</h3>
              <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                {bio}
              </p>
            </div>

            {expertise.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Expertise & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Reviews Section ── */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24" id="reviews">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Student Reviews</h3>
            
            {loadingReviews ? (
              <div className="animate-pulse space-y-6">
                {[1,2].map(i => (
                  <div key={i} className="flex gap-4 pb-6 border-b border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                      <div className="h-4 w-full bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-bold text-slate-900">No reviews yet</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Be the first to book a session and leave a review for {mentor.name.split(' ')[0]}.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Summary */}
                <div className="flex flex-col sm:flex-row gap-8 pb-8 border-b border-slate-100">
                  <div className="sm:w-1/3 flex flex-col items-center justify-center text-center p-6 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">{effectiveRating.toFixed(1)}</span>
                    <div className="flex gap-1 mt-2 mb-1">
                      {[1,2,3,4,5].map((star) => (
                         <Star key={star} className={`h-4 w-4 ${star <= Math.round(effectiveRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-500">From {reviewCount} reviews</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="w-2 font-medium text-slate-600 text-sm">{item.stars}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="w-9 text-right text-xs font-semibold text-slate-500">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {displayedReviews.map((review) => (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        key={review._id} 
                        className="pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <AppImage
                            src={getImageUrl(review.student.profileImage, review.student.name, 100)}
                            alt={review.student.name}
                            width={44}
                            height={44}
                            className="rounded-full bg-slate-100 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-900">{review.student.name}</span>
                              <span className="text-xs font-medium text-slate-400">{formatReviewDate(review.createdAt)}</span>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                               {[1,2,3,4,5].map((star) => (
                                 <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                               ))}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {showAllReviews ? 'Show less' : `Show all ${reviews.length} reviews`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Sticky Booking Widget) */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-24 bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Book a Session</h3>
            <p className="text-sm text-slate-500 mb-6">Get 1-on-1 personalized guidance from {mentor.name.split(' ')[0]}.</p>
            
            <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{formatPrice(pricePerSession)}</span>
              <span className="text-sm font-semibold text-slate-400 mb-1">/ session</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">{sessionDuration} Min Session</p>
                  <p className="text-xs text-slate-500 mt-0.5">High-impact focused meeting</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Flexible Scheduling</p>
                  <p className="text-xs text-slate-500 mt-0.5">Book a time that works for you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Direct Messaging</p>
                  <p className="text-xs text-slate-500 mt-0.5">Chat with mentor before/after</p>
                </div>
              </div>
            </div>

            <Link
              href={bookingHref}
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoggedIn ? 'Book Now' : 'Sign in to book'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Secure payment. Cancel anytime up to 24h before.
            </p>
          </div>
        </div>

      </div>
    </div>
  );

  if (variant === 'student') {
    return content;
  }

  // Public wrapper
  return (
    <div className="min-h-screen bg-slate-50/50">
      {content}
    </div>
  );
}
