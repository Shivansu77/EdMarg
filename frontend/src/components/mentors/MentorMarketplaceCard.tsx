'use client';

import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';

import { getImageUrl } from '@/utils/imageUrl';

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

  const imageUrl = getImageUrl(mentor.profileImage, mentor.name, 400);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-emerald-300/60 hover:shadow-[0_12px_40px_rgba(16,185,129,0.1)]"
    >
      {/* ── Hero Image ── */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        <Image
          src={imageUrl}
          alt={mentor.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge row */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {mentor.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Rating pill on image */}
        {showRating && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {mentor.rating.toFixed(1)}
          </div>
        )}

        {/* Name + role overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5">
          <h3 className="truncate text-lg font-bold tracking-tight text-white drop-shadow-md">
            {mentor.name}
          </h3>
          <p className="truncate text-sm font-medium text-white/85 drop-shadow-sm">
            {mentor.currentTitle && mentor.currentCompany
              ? `${mentor.currentTitle} @ ${mentor.currentCompany}`
              : mentor.currentTitle || mentor.currentCompany
                ? `${mentor.currentTitle || mentor.currentCompany}`
                : mentor.roleTitle}
          </p>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3.5">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {mentor.experienceYears > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <Briefcase className="h-3 w-3" />
                Exp
              </div>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{mentor.experienceYears} yrs</p>
            </div>
          )}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Users className="h-3 w-3" />
              Sessions
            </div>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{mentor.sessionCount}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Clock3 className="h-3 w-3" />
              Duration
            </div>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{mentor.sessionDuration}m</p>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="line-clamp-2 text-[13px] leading-[1.6] text-slate-600">
            {mentor.bio}
          </p>
        )}

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={`${mentor.id}-${skill}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {skill}
              </span>
            ))}
            {remainingSkillCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                +{remainingSkillCount}
              </span>
            )}
          </div>
        )}

        {/* Languages & Location */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {mentor.languages && mentor.languages.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50/80 px-2 py-0.5 font-semibold text-sky-700">
              <Globe className="h-3 w-3" />
              {mentor.languages.slice(0, 2).join(', ')}
              {mentor.languages.length > 2 && ` +${mentor.languages.length - 2}`}
            </span>
          )}
          {mentor.location && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 font-medium text-slate-500">
              <MapPin className="h-3 w-3" />
              {mentor.location}
            </span>
          )}
        </div>

        {/* Price + Actions — pushed to bottom */}
        <div className="mt-auto border-t border-slate-100 pt-3">
          <div className="mb-3 flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                {formatPrice(mentor.price)}
              </span>
              {mentor.price > 0 && (
                <span className="text-xs font-medium text-slate-400">/session</span>
              )}
            </div>
            {mentor.oldPrice && mentor.oldPrice > mentor.price && mentor.price > 0 && (
              <span className="text-xs font-medium text-slate-400 line-through">
                ₹{mentor.oldPrice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/student/mentors/${mentor.id}`}
              className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-slate-200 px-3 text-[13px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              View Profile
            </Link>
            <Link
              href={connectHref}
              className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl bg-slate-950 px-3 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(15,23,42,0.2)] transition-all hover:bg-slate-800 hover:shadow-[0_8px_24px_rgba(15,23,42,0.28)]"
            >
              Connect
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
