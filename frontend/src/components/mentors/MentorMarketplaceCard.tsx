'use client';

import Link from 'next/link';
import AppImage from '@/components/AppImage';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock3,
  Globe,
  MapPin,
  Star,
  Users,
  Heart,
  Award,
} from 'lucide-react';

import { getImageUrl } from '@/utils/imageUrl';
import { useWishlist } from '@/hooks/useWishlist';

export interface MentorMarketplaceCardData {
  id: string;
  name: string;
  profileImage?: string;
  roleTitle: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  experienceYears: number;
  sessionCount: number;
  price: number;
  oldPrice?: number;
  isVerified: boolean;
  linkedinUrl?: string;
  sessionDuration: number;
  languages?: string[];
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
}

interface MentorMarketplaceCardProps {
  mentor: MentorMarketplaceCardData;
  isLoggedIn: boolean;
  priority?: boolean;
}

const formatPrice = (price: number) => {
  if (!price || price <= 0) return 'Free';
  return `₹${price}`;
};

export default function MentorMarketplaceCard({
  mentor,
  isLoggedIn,
  priority = false,
}: MentorMarketplaceCardProps) {
  const visibleSkills = mentor.skills.slice(0, 3);
  const remainingSkillCount = Math.max(mentor.skills.length - visibleSkills.length, 0);
  const showRating = mentor.rating > 0;
  const connectHref = isLoggedIn
    ? `/student/booking?id=${mentor.id}`
    : `/login?redirect=${encodeURIComponent(`/student/booking?id=${mentor.id}`)}`;

  const imageUrl = getImageUrl(mentor.profileImage, mentor.name, 200);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(mentor.id);

  // Compute display title
  const displayTitle =
    mentor.currentTitle && mentor.currentCompany
      ? `${mentor.currentTitle} @ ${mentor.currentCompany}`
      : mentor.currentTitle || mentor.currentCompany
        ? `${mentor.currentTitle || mentor.currentCompany}`
        : mentor.roleTitle;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col h-full w-full rounded-[20px] bg-white border border-slate-200 overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:border-emerald-200"
    >
      {/* ── Top Accent Bar ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-400 opacity-80" />

      {/* ── Wishlist Button ── */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(mentor.id);
        }}
        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 shadow-sm transition-all hover:scale-110 active:scale-95 hover:bg-red-50 hover:border-red-100 hover:text-red-500"
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* ── Card Header (Avatar + Name) ── */}
      <div className="flex items-start gap-4 p-5 pt-6">
        {/* Avatar Area */}
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 p-0.5">
            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm">
              <AppImage
                src={imageUrl}
                alt={mentor.name}
                fill
                priority={priority}
                fallbackName={mentor.name}
                sizes="64px"
                className="object-cover object-top"
              />
            </div>
          </div>
          {/* Online/Active Indicator */}
          <span className="absolute bottom-1 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
        </div>

        {/* Name & Title */}
        <div className="flex min-w-0 flex-1 flex-col pt-1">
          <div className="flex flex-wrap items-center gap-1.5 pr-6">
            <h3 className="truncate text-lg font-bold text-slate-900 leading-tight">
              {mentor.name}
            </h3>
            {mentor.isVerified && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-[13px] font-medium text-slate-500">
            {displayTitle}
          </p>
          
          {/* Rating */}
          {showRating && (
            <div className="mt-1.5 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[13px] font-bold text-slate-700">{mentor.rating.toFixed(1)}</span>
              <span className="text-[12px] text-slate-400">({mentor.sessionCount} sessions)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Compact Stats Row */}
        <div className="mb-4 flex flex-wrap gap-2">
          {mentor.experienceYears > 0 && (
            <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 border border-slate-100">
              <Award className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">{mentor.experienceYears} Yrs Exp</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 border border-slate-100">
            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-600">{mentor.sessionDuration}m Duration</span>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
            {mentor.bio}
          </p>
        )}

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={`${mentor.id}-${skill}`}
                className="inline-flex items-center rounded bg-emerald-50/80 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                {skill}
              </span>
            ))}
            {remainingSkillCount > 0 && (
              <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                +{remainingSkillCount}
              </span>
            )}
          </div>
        )}

        {/* Language & Location */}
        <div className="mt-auto mb-4 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
          {mentor.languages && mentor.languages.length > 0 && (
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{mentor.languages.slice(0, 2).join(', ')}{mentor.languages.length > 2 && ` +${mentor.languages.length - 2}`}</span>
            </div>
          )}
          {mentor.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[120px]">{mentor.location}</span>
            </div>
          )}
        </div>

        {/* ── Footer: Price & Actions ── */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">Session Price</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {formatPrice(mentor.price)}
                </span>
                {mentor.oldPrice && mentor.oldPrice > mentor.price && mentor.price > 0 && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ₹{mentor.oldPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.2fr] gap-2">
            <Link
              href={`/student/mentors/${mentor.id}`}
              className="flex h-[42px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
            >
              View Profile
            </Link>
            <Link
              href={connectHref}
              className="group/btn flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] transition-all hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
            >
              Book Session
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
