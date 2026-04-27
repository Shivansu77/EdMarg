'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MentorMarketplaceCard, {
  type MentorMarketplaceCardData,
} from '@/components/mentors/MentorMarketplaceCard';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { resolveApiBaseUrl } from '@/utils/api-base';

type Mentor = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    rating?: number;
    language?: string;
    totalSessions?: number;
    sessionDuration?: number;
    autoConfirm?: boolean;
    linkedinUrl?: string;
  };
};

type PriceFilter = 'all' | 'free' | 'under-499' | 'under-999' | 'premium';
type SortOption = 'recommended' | 'rating' | 'sessions' | 'price-low' | 'newest';

type MentorVM = MentorMarketplaceCardData & {
  domain: string;
  searchText: string;
  ratingVal: number;
  priceVal: number;
  createdAtVal: number;
  score: number;
};

const API = resolveApiBaseUrl();
const PAGE_SIZE = 12;
const ALL = 'All Domains';

const PRICE_OPTS: { label: string; value: PriceFilter }[] = [
  { label: 'Any price', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Under ₹499', value: 'under-499' },
  { label: 'Under ₹999', value: 'under-999' },
  { label: 'Premium ₹1000+', value: 'premium' },
];

const SORT_OPTS: { label: string; value: SortOption }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Top rated', value: 'rating' },
  { label: 'Most sessions', value: 'sessions' },
  { label: 'Price: low to high', value: 'price-low' },
  { label: 'Newest', value: 'newest' },
];

const inferDomain = (skills: string[], bio: string) => {
  const s = `${skills.join(' ')} ${bio}`.toLowerCase();
  if (s.includes('react') || s.includes('frontend') || s.includes('next')) return 'Frontend';
  if (s.includes('full stack') || s.includes('fullstack')) return 'Full Stack';
  if (s.includes('backend') || s.includes('node') || s.includes('api')) return 'Backend';
  if (s.includes('data') || s.includes('ai') || s.includes('machine learning') || s.includes('python')) return 'Data & AI';
  if (s.includes('design') || s.includes('ux') || s.includes('ui') || s.includes('figma')) return 'Design';
  if (s.includes('cloud') || s.includes('devops') || s.includes('aws') || s.includes('docker')) return 'Cloud & DevOps';
  if (s.includes('mobile') || s.includes('android') || s.includes('ios') || s.includes('flutter')) return 'Mobile';
  if (s.includes('career') || s.includes('resume') || s.includes('interview')) return 'Career';
  if (s.includes('product') || s.includes('growth')) return 'Product';
  if (s.includes('web3') || s.includes('blockchain')) return 'Web3';
  return 'General';
};

const matchPrice = (p: number, f: PriceFilter) => {
  if (f === 'all') return true;
  if (f === 'free') return p <= 0;
  if (f === 'under-499') return p > 0 && p <= 499;
  if (f === 'under-999') return p > 0 && p <= 999;
  return p >= 1000;
};

const sortList = (list: MentorVM[], by: SortOption) => {
  const c = [...list];
  c.sort((a, b) => {
    if (by === 'rating') return b.ratingVal - a.ratingVal || b.score - a.score;
    if (by === 'sessions') return b.sessionCount - a.sessionCount;
    if (by === 'price-low') return a.priceVal - b.priceVal;
    if (by === 'newest') return b.createdAtVal - a.createdAtVal;
    return b.score - a.score;
  });
  return c;
};

function MentorsContent() {
  const sp = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState(sp.get('search') || '');
  const [domain, setDomain] = useState(ALL);
  const [price, setPrice] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { const q = sp.get('search'); if (q !== null) setSearch(q); }, [sp]);
  useEffect(() => { setIsLoggedIn(Boolean(localStorage.getItem('token'))); }, []);

  const fetchPage = async (page: number, append = false) => {
    const res = await fetch(
      `${API}/api/v1/users/browsementor?page=${page}&limit=${PAGE_SIZE}`,
      createAuthenticatedRequestInit({ method: 'GET' })
    );
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    const r = await res.json();
    const d: Mentor[] = Array.isArray(r?.data) ? r.data : [];
    setMentors(prev => {
      if (!append) return d;
      const m = new Map(prev.map(x => [x._id, x]));
      d.forEach(x => m.set(x._id, x));
      return Array.from(m.values());
    });
    if (typeof r?.total === 'number') setTotalCount(r.total);
    else if (!append) setTotalCount(d.length);
    setHasMore(typeof r?.pages === 'number' ? page < r.pages : d.length === PAGE_SIZE);
  };

  useEffect(() => {
    (async () => {
      try { setLoading(true); setError(null); await fetchPage(1); setCurrentPage(1); }
      catch (e) { setError(e instanceof Error ? e.message : 'Unable to fetch mentors.'); setMentors([]); }
      finally { setLoading(false); }
    })();
  }, []);

  // Build view models from real API data only
  const cards = useMemo<MentorVM[]>(() => mentors.map(m => {
    const mp = m.mentorProfile;
    const skills = (mp?.expertise || []).map(s => s.trim()).filter(Boolean);
    const bio = mp?.bio?.trim() || '';
    const dom = inferDomain(skills, bio);
    const rating = mp?.rating && mp.rating > 0 ? Number(mp.rating.toFixed(1)) : 0;
    const sessions = mp?.totalSessions || 0;
    const exp = mp?.experienceYears || 0;
    const p = typeof mp?.pricePerSession === 'number' ? mp.pricePerSession : 0;
    const dur = mp?.sessionDuration || 45;
    const created = m.createdAt ? new Date(m.createdAt).getTime() : 0;
    const searchText = [m.name, m.email, bio, ...skills, dom].join(' ').toLowerCase();
    const score = rating * 20 + Math.min(sessions, 200) * 0.25 + exp * 3 - p / 1000;
    const roleTitle = skills.length > 0 ? `${skills[0]} Mentor` : `${dom} Mentor`;

    return {
      id: m._id, name: m.name, profileImage: m.profileImage,
      roleTitle, bio, skills: skills.slice(0, 5),
      rating, reviewCount: sessions, experienceYears: exp,
      sessionCount: sessions, price: p, isVerified: true,
      linkedinUrl: mp?.linkedinUrl, sessionDuration: dur,
      domain: dom, searchText, ratingVal: rating, priceVal: p,
      createdAtVal: created, score,
    };
  }), [mentors]);

  const domainOpts = useMemo(
    () => [ALL, ...Array.from(new Set(cards.map(c => c.domain))).sort()],
    [cards]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter(c => {
      if (q && !c.searchText.includes(q)) return false;
      if (domain !== ALL && c.domain !== domain) return false;
      if (!matchPrice(c.priceVal, price)) return false;
      return true;
    });
  }, [cards, search, domain, price]);

  const sorted = useMemo(() => sortList(filtered, sortBy), [filtered, sortBy]);

  const avgRating = useMemo(() => {
    const rated = cards.filter(c => c.ratingVal > 0);
    if (!rated.length) return 0;
    return Number((rated.reduce((s, c) => s + c.ratingVal, 0) / rated.length).toFixed(1));
  }, [cards]);

  const activeCount = (search.trim() ? 1 : 0) + (domain !== ALL ? 1 : 0) + (price !== 'all' ? 1 : 0) + (sortBy !== 'recommended' ? 1 : 0);

  const clearFilters = () => { setSearch(''); setDomain(ALL); setPrice('all'); setSortBy('recommended'); };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    const next = currentPage + 1;
    try { setLoadingMore(true); await fetchPage(next, true); setCurrentPage(next); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load more.'); }
    finally { setLoadingMore(false); }
  };

  const refresh = async () => {
    try { setLoading(true); setError(null); await fetchPage(1); setCurrentPage(1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Refresh failed.'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout userName="Mentors">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(236,253,245,0.9),_rgba(248,250,252,0.86)_32%,_#ffffff_70%)] pb-16">
        <div className="space-y-6">
          {/* Hero */}
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="grid gap-8 px-6 py-7 lg:grid-cols-[1.2fr_0.9fr] lg:px-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-600">Mentor Marketplace</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Mentors</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Connect with experts who can guide your career, sharpen your skills, and help you move faster with focused 1:1 sessions.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800">
                    <ShieldCheck className="h-4 w-4" /> {cards.length} verified mentors
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {avgRating > 0 ? `${avgRating} avg rating` : 'New talent joining weekly'}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-semibold text-sky-800">
                    <TrendingUp className="h-4 w-4" /> {totalCount || cards.length} total profiles
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(236,253,245,0.75))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Find your next mentor</p>
                    <p className="mt-1 text-sm text-slate-500">Search by skill, name, or domain.</p>
                  </div>
                  <button type="button" onClick={refresh} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900" aria-label="Refresh">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search by skill, name, or domain" value={search} onChange={e => setSearch(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Showing</p>
                    <p className="mt-2 text-xl font-bold text-slate-950">{filtered.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Matched</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total</p>
                    <p className="mt-2 text-xl font-bold text-slate-950">{Math.max(totalCount, cards.length)}</p>
                    <p className="mt-1 text-xs text-slate-500">Profiles</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Filters</p>
                    <p className="mt-2 text-xl font-bold text-slate-950">{activeCount}</p>
                    <p className="mt-1 text-xs text-slate-500">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filter bar */}
          <section className="rounded-[28px] border border-slate-200 bg-white/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[170px] flex-1 sm:flex-none">
                <select value={domain} onChange={e => setDomain(e.target.value)} className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white">
                  {domainOpts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative min-w-[150px] flex-1 sm:flex-none">
                <select value={price} onChange={e => setPrice(e.target.value as PriceFilter)} className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white">
                  {PRICE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative min-w-[170px] flex-1 sm:flex-none">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white">
                  {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <button type="button" onClick={() => setShowFilters(v => !v)}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-colors ${showFilters || activeCount > 0 ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeCount > 0 && <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold">{activeCount}</span>}
              </button>
            </div>
            {showFilters && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setSortBy('rating')} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50">Top mentors</button>
                  <button type="button" onClick={() => setPrice('under-499')} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50">Budget friendly</button>
                  <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                    <X className="h-4 w-4" /> Reset all
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="animate-pulse rounded-[22px] border border-slate-200 bg-white overflow-hidden">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">{Array.from({length:3}).map((_,j)=><div key={j} className="h-14 rounded-xl bg-slate-100"/>)}</div>
                    <div className="h-3 w-full rounded-full bg-slate-100" />
                    <div className="h-3 w-4/5 rounded-full bg-slate-100" />
                    <div className="flex gap-2"><div className="h-6 w-16 rounded-full bg-slate-100"/><div className="h-6 w-20 rounded-full bg-slate-100"/></div>
                    <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2"><div className="h-10 rounded-xl bg-slate-100"/><div className="h-10 rounded-xl bg-slate-200"/></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50/80 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white p-3 text-red-500 shadow-sm"><AlertCircle className="h-5 w-5" /></div>
                  <div>
                    <p className="text-base font-bold text-red-950">Could not load mentors</p>
                    <p className="mt-1 text-sm leading-6 text-red-700">{error}</p>
                  </div>
                </div>
                <button type="button" onClick={refresh} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-900">Retry</button>
              </div>
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Search className="h-7 w-7" /></div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">No mentors match these filters</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Try widening your search or switching back to recommended sorting.</p>
              <button type="button" onClick={clearFilters} className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">Clear all filters</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Showing {sorted.length} mentors</p>
                  <p className="mt-1 text-sm text-slate-500">All data is from real mentor profiles.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Sorted by {SORT_OPTS.find(o => o.value === sortBy)?.label}
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sorted.map((m, i) => (
                  <MentorMarketplaceCard key={m.id} mentor={m} isLoggedIn={isLoggedIn} priority={i < 4} />
                ))}
              </motion.div>

              {hasMore && (
                <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-950">Want more mentors?</p>
                      <p className="mt-1 text-sm text-slate-500">Load more profiles to expand your options.</p>
                    </div>
                    <button type="button" onClick={loadMore} disabled={!hasMore || loadingMore}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50">
                      {loadingMore ? 'Loading...' : `Load ${PAGE_SIZE} more`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MentorsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-900" /></div>}>
        <MentorsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
