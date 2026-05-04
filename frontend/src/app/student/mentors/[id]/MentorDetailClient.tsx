'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Globe,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

import { getImageUrl } from '@/utils/imageUrl';
import { resolveApiBaseUrl } from '@/utils/api-base';

const API_BASE_URL = resolveApiBaseUrl();
const PANEL_CLASS =
  'rounded-[30px] border border-white/70 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl';

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
  if (!price || price <= 0) {
    return 'Free';
  }

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
    if (explicitLanguages.length > 0) {
      return explicitLanguages;
    }

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
  const latestReview = reviews[0];
  const recommendationCount = (distributionSource?.[5] || 0) + (distributionSource?.[4] || 0);
  const recommendationRate = reviewCount > 0 ? Math.round((recommendationCount / reviewCount) * 100) : 0;
  const reviewActionHref = isLoggedIn ? '/student/history' : `/login?redirect=${encodeURIComponent('/student/history')}`;
  const bookingHref = isLoggedIn
    ? `/student/booking?id=${mentor._id}`
    : `/login?redirect=${encodeURIComponent(`/student/booking?id=${mentor._id}`)}`;
  const backHref = variant === 'student' ? '/student/mentors' : '/browse-mentors';
  const backLabel = variant === 'student' ? 'Back to mentors' : 'Back to marketplace';
  const heroEyebrow = variant === 'student' ? 'Student Mentor Match' : 'Mentor Profile';
  const nameFirst = mentor.name.split(' ')[0] || mentor.name;
  const headlineRole =
    currentTitle && currentCompany
      ? `${currentTitle} @ ${currentCompany}`
      : currentTitle || currentCompany || expertise[0] || 'Professional mentor';
  const studentSignalText =
    reviewCount > 0
      ? `${recommendationRate}% of students rated ${nameFirst} 4 stars or above`
      : 'Fresh mentor profile open for focused student conversations';
  const expertiseDisplay = expertise.length > 0 ? expertise : ['Career guidance', 'Roadmap planning', 'Focused feedback'];
  const latestReviewSnippet =
    latestReview?.comment && latestReview.comment.length > 180
      ? `${latestReview.comment.slice(0, 177)}...`
      : latestReview?.comment || '';

  const heroStats = [
    {
      label: 'Average rating',
      value: reviewCount > 0 ? effectiveRating.toFixed(1) : mentorRating > 0 ? mentorRating.toFixed(1) : 'New',
      caption: reviewCount > 0 ? `${reviewCount} verified student reviews` : 'Awaiting first student review',
      icon: Star,
      accent: 'text-amber-500 bg-amber-50 border-amber-100',
    },
    {
      label: 'Sessions guided',
      value: sessionCount > 0 ? `${sessionCount}` : 'Flexible',
      caption: `${sessionDuration}-minute mentorship format`,
      icon: Users,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Experience depth',
      value: experienceYears > 0 ? `${experienceYears}+ yrs` : 'Practical',
      caption: currentCompany || 'Built for student-ready conversations',
      icon: Briefcase,
      accent: 'text-sky-600 bg-sky-50 border-sky-100',
    },
  ];

  const summaryCards = [
    {
      label: 'Focus area',
      value: expertiseDisplay[0],
      caption: expertise.length > 1 ? `${expertise.length} expertise areas available` : 'Tailored mentor guidance',
    },
    {
      label: 'Session style',
      value: `${sessionDuration} min`,
      caption: 'Focused 1:1 video conversation',
    },
    {
      label: 'Communication',
      value: languages.slice(0, 2).join(', '),
      caption: location ? `Based in ${location}` : 'Comfortable multi-language support',
    },
  ];

  const trustPoints = [
    `${sessionDuration}-minute focused mentorship session`,
    experienceYears > 0 ? `${experienceYears}+ years of practical experience` : 'Practical guidance shaped for students',
    reviewCount > 0 ? `${reviewCount} verified student reviews` : 'New mentor profile with direct support',
    languages.length > 0 ? `Sessions available in ${languages.join(', ')}` : 'Clear communication support',
  ];

  const includedItems = [
    '1:1 personalized video guidance',
    'Clear next steps after the conversation',
    'Focused discussion around your goals or blockers',
    'Contextual advice shaped by real experience',
  ];

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: distributionSource?.[stars as keyof ReviewDistribution] || 0,
    percentage: getRatingPercentage(distributionSource?.[stars as keyof ReviewDistribution] || 0, reviewCount),
  }));

  const content = (
    <div className={variant === 'student' ? 'space-y-8' : 'mx-auto max-w-7xl space-y-8 px-6 pb-20 pt-8 lg:px-8 lg:pt-10'}>
      <section className={`${PANEL_CLASS} relative overflow-hidden p-6 sm:p-8 lg:p-10`}>
        <div className="pointer-events-none absolute -left-12 top-8 h-52 w-52 rounded-full bg-emerald-200/40 blur-[90px]" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-cyan-100/55 blur-[90px]" />

        <div className="relative z-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="mt-6 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:h-36 sm:w-36">
                  <AppImage
                    src={getImageUrl(mentor.profileImage, mentor.name, 420)}
                    alt={mentor.name}
                    width={144}
                    height={144}
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    {heroEyebrow}
                  </div>

                  <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                    {mentor.name}
                  </h1>
                  <p className="mt-3 text-base font-semibold text-slate-600 sm:text-lg">{headlineRole}</p>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {reviewCount > 0 ? `${effectiveRating.toFixed(1)} rating` : 'New profile'}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-600">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      {experienceYears > 0 ? `${experienceYears}+ years experience` : 'Practical mentor support'}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/85 px-3 py-1.5 text-sm font-semibold text-sky-800">
                      <Globe className="h-4 w-4" />
                      {languages.slice(0, 2).join(', ')}
                    </div>
                    {location ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        {location}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="mt-7 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{bio}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={bookingHref}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  {isLoggedIn ? 'Book a session' : 'Sign in to book'}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href="#reviews"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 px-6 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  Read student reviews
                </a>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.label} className="rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${item.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.caption}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-[28px] border border-emerald-200/70 bg-linear-to-br from-emerald-50/90 via-white to-cyan-50/75 p-6 shadow-[0_18px_45px_rgba(16,185,129,0.08)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Best fit</p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
                Students usually book {nameFirst} for focused, practical guidance.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{studentSignalText}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {expertiseDisplay.slice(0, 4).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Student trust signal',
                    description: reviewCount > 0 ? `${recommendationRate}% positive recommendation rate` : 'Early-access mentor profile ready for bookings',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Momentum support',
                    description: sessionCount > 0 ? `${sessionCount} sessions already guided` : 'Focused one-on-one mentorship flow',
                  },
                  {
                    icon: CalendarDays,
                    title: 'Session rhythm',
                    description: `${sessionDuration}-minute mentorship conversation with actionable next steps`,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-2xl border border-white/80 bg-white/78 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {latestReviewSnippet ? (
                <div className="mt-6 rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Latest student note</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">&ldquo;{latestReviewSnippet}&rdquo;</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">- {latestReview.student.name}</p>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <section className={`${PANEL_CLASS} p-6 sm:p-8`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">About this mentor</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">What a session here can unlock</h2>
              </div>
              <div className="rounded-full border border-white/70 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-500">
                Built for clear, focused conversations
              </div>
            </div>

            <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">{bio}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {summaryCards.map((item) => (
                <article key={item.label} className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                  <p className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.caption}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-6 sm:p-8`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Focus areas</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Where {nameFirst} can help most</h2>
              </div>
              <div className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                {expertiseDisplay.length} guidance areas
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {expertiseDisplay.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: 'Clarity first',
                  description: 'Use the session to narrow options, validate next steps, and reduce guesswork.',
                },
                {
                  icon: Award,
                  title: 'Actionable feedback',
                  description: 'Expect concrete suggestions rather than generic motivation or surface-level advice.',
                },
                {
                  icon: Users,
                  title: 'Student-friendly pacing',
                  description: 'Ideal for learners who want focused help without overcomplicating the path ahead.',
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-base font-bold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="reviews" className={`${PANEL_CLASS} scroll-mt-28 p-6 sm:p-8`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Student feedback</p>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">What students are saying</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Reviews come from completed mentorship sessions and help you judge fit before booking.
                </p>
              </div>

              <div className="rounded-[24px] border border-amber-100 bg-amber-50/85 p-4 shadow-sm lg:max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 ring-1 ring-amber-100">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Want to leave your own rating later?</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Students can submit stars and written feedback after a completed session.
                    </p>
                    <Link
                      href={reviewActionHref}
                      className="mt-3 inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      {isLoggedIn ? 'Open session history' : 'Sign in to review later'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {loadingReviews ? (
              <div className="mt-8 grid gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`review-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-slate-100 bg-slate-50/80 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded-full bg-slate-200" />
                        <div className="h-3 w-20 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-full rounded-full bg-slate-100" />
                      <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white/85 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">No reviews yet</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  This mentor is new or early in their EdMarg journey. You can still book a session and become one of
                  the first students to leave verified feedback.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[26px] border border-slate-100 bg-slate-50/85 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Rating summary</p>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-5xl font-extrabold tracking-tight text-slate-950">
                        {effectiveRating.toFixed(1)}
                      </span>
                      <span className="pb-2 text-sm font-semibold text-slate-500">out of 5</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(effectiveRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">Based on {reviewCount} verified student reviews.</p>
                  </div>

                  <div className="rounded-[26px] border border-slate-100 bg-slate-50/85 p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Review distribution</p>
                    <div className="mt-4 space-y-3">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3 text-sm">
                          <span className="w-3 font-semibold text-slate-600">{item.stars}</span>
                          <Star className="h-3.5 w-3.5 fill-slate-300 text-slate-300" />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs font-semibold text-slate-500">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-[24px] border border-slate-100 bg-slate-50/85 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Recommended</p>
                    <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{recommendationRate}%</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Students gave 4 or 5 stars.</p>
                  </article>
                  <article className="rounded-[24px] border border-slate-100 bg-slate-50/85 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Verified reviews</p>
                    <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">{reviewCount}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Feedback from completed sessions.</p>
                  </article>
                  <article className="rounded-[24px] border border-slate-100 bg-slate-50/85 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Latest review</p>
                    <p className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">
                      {latestReview ? formatReviewDate(latestReview.createdAt) : 'Awaiting first review'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Fresh student sentiment from recent sessions.</p>
                  </article>
                </div>

                <div className="space-y-4">
                  {displayedReviews.map((review) => (
                    <article
                      key={review._id}
                      className="rounded-[24px] border border-slate-100 bg-slate-50/82 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)]"
                    >
                      <div className="flex items-start gap-4">
                        <AppImage
                          src={getImageUrl(review.student.profileImage, review.student.name, 120)}
                          alt={review.student.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full border border-slate-200 object-cover object-top"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{review.student.name}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={`${review._id}-${star}`}
                                    className={`h-3.5 w-3.5 ${
                                      star <= review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-slate-200 text-slate-200'
                                    }`}
                                  />
                                ))}
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                                  {review.rating}.0 rating
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                  Verified session
                                </span>
                              </div>
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>

                          <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {reviews.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllReviews((current) => !current)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    {showAllReviews ? 'Show fewer reviews' : `View all ${reviews.length} reviews`}
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <section className="relative overflow-hidden rounded-[30px] border border-emerald-300/35 bg-linear-to-br from-slate-950 via-emerald-950 to-teal-900 p-6 text-white shadow-[0_28px_80px_rgba(16,185,129,0.24)]">
            <div className="absolute inset-x-0 top-0 h-36 bg-linear-to-b from-white/10 to-transparent" />
            <div className="absolute -right-14 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">Session investment</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-white">{formatPrice(pricePerSession)}</span>
                <span className="pb-1 text-sm font-semibold text-emerald-100/80">/ session</span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <Clock3 className="h-4 w-4 text-emerald-100" />
                  <span className="text-sm font-semibold text-white">{sessionDuration} minute focused format</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <CalendarDays className="h-4 w-4 text-emerald-100" />
                  <span className="text-sm font-semibold text-white">Flexible scheduling based on availability</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <Globe className="h-4 w-4 text-emerald-100" />
                  <span className="text-sm font-semibold text-white">{languages.join(', ')}</span>
                </div>
              </div>

              <Link
                href={bookingHref}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-emerald-950 shadow-[0_16px_35px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {isLoggedIn ? 'Book this mentor' : 'Sign in to book'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                No charges until confirmed
              </p>
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-6`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">Why students choose {nameFirst}</p>
            <div className="mt-5 space-y-4">
              {trustPoints.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <Award className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${PANEL_CLASS} p-6`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">What&apos;s included</p>
            <div className="mt-5 space-y-4">
              {includedItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  if (variant === 'student') {
    return content;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,252,231,0.75),_rgba(248,250,252,0.92)_35%,_#ffffff_72%)]">
      <div className="pointer-events-none absolute left-0 top-24 h-64 w-64 rounded-full bg-emerald-200/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-cyan-100/35 blur-[130px]" />
      {content}
    </div>
  );
}
