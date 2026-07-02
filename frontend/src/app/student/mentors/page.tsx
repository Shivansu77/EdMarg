'use client';

import { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Users,
  Filter,
  LayoutGrid,
  List,
  Zap,
} from 'lucide-react';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MentorMarketplaceCard, {
  type MentorMarketplaceCardData,
} from '@/components/mentors/MentorMarketplaceCard';
import RecommendedMentors from '@/components/RecommendedMentors';
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
    languages?: string[];
    currentCompany?: string;
    currentTitle?: string;
    location?: string;
    education?: string;
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

const SORT_OPTS: { label: string; value: SortOption; icon: typeof Star }[] = [
  { label: 'Recommended', value: 'recommended', icon: Sparkles },
  { label: 'Top rated', value: 'rating', icon: Star },
  { label: 'Most sessions', value: 'sessions', icon: Users },
  { label: 'Price: low to high', value: 'price-low', icon: TrendingUp },
  { label: 'Newest', value: 'newest', icon: Zap },
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

// Domain color mapping for category pills
const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Frontend': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Backend': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Full Stack': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Data & AI': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Design': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  'Cloud & DevOps': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'Mobile': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Career': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Product': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Web3': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'General': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      languages: mp?.languages || [],
      currentCompany: mp?.currentCompany || '',
      currentTitle: mp?.currentTitle || '',
      location: mp?.location || '',
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

  // Domain counts for filter pills
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(c => {
      counts[c.domain] = (counts[c.domain] || 0) + 1;
    });
    return counts;
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
      <style>{mentorPageStyles}</style>
      <div className="mmp-page">
        <div className="mmp-content">

          {/* ── Hero Section ─────────────────────────────────── */}
          <section className="mmp-hero">
            <div className="mmp-hero-bg" />
            <div className="mmp-hero-content">
              <div className="mmp-hero-left">
                <div className="mmp-hero-badge">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Mentor Marketplace</span>
                </div>
                <h1 className="mmp-hero-title">
                  Find Your Perfect<br />
                  <span className="mmp-hero-title-accent">Mentor</span>
                </h1>
                <p className="mmp-hero-desc">
                  Connect with verified industry experts for personalized 1:1 mentorship sessions. 
                  Accelerate your career growth with focused guidance.
                </p>

                {/* Stats Row */}
                <div className="mmp-hero-stats">
                  <div className="mmp-stat">
                    <div className="mmp-stat-icon mmp-stat-icon-green">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="mmp-stat-value">{cards.length}</p>
                      <p className="mmp-stat-label">Verified Mentors</p>
                    </div>
                  </div>
                  <div className="mmp-stat-divider" />
                  <div className="mmp-stat">
                    <div className="mmp-stat-icon mmp-stat-icon-amber">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="mmp-stat-value">{avgRating > 0 ? avgRating : '—'}</p>
                      <p className="mmp-stat-label">Avg Rating</p>
                    </div>
                  </div>
                  <div className="mmp-stat-divider" />
                  <div className="mmp-stat">
                    <div className="mmp-stat-icon mmp-stat-icon-blue">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="mmp-stat-value">{totalCount || cards.length}</p>
                      <p className="mmp-stat-label">Total Profiles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Panel */}
              <div className="mmp-search-panel">
                <div className="mmp-search-panel-header">
                  <Search className="h-5 w-5 text-slate-400" />
                  <h3 className="mmp-search-panel-title">Quick Search</h3>
                  <button type="button" onClick={refresh} className="mmp-refresh-btn" aria-label="Refresh">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                </div>
                <div className={`mmp-search-input-wrap ${searchFocused ? 'mmp-search-focused' : ''}`}>
                  <Search className="mmp-search-icon" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by skill, name, or domain..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="mmp-search-input"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="mmp-search-clear">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mmp-quick-stats">
                  <div className="mmp-quick-stat">
                    <span className="mmp-quick-stat-num">{filtered.length}</span>
                    <span className="mmp-quick-stat-label">Matched</span>
                  </div>
                  <div className="mmp-quick-stat">
                    <span className="mmp-quick-stat-num">{Math.max(totalCount, cards.length)}</span>
                    <span className="mmp-quick-stat-label">Total</span>
                  </div>
                  <div className="mmp-quick-stat">
                    <span className="mmp-quick-stat-num">{activeCount}</span>
                    <span className="mmp-quick-stat-label">Filters</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Domain Categories ─────────────────────────────── */}
          {!loading && cards.length > 0 && (
            <section className="mmp-domains-section">
              <div className="mmp-domains-scroll">
                <button
                  onClick={() => setDomain(ALL)}
                  className={`mmp-domain-pill ${domain === ALL ? 'mmp-domain-active' : ''}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>All</span>
                  <span className="mmp-domain-count">{cards.length}</span>
                </button>
                {domainOpts.filter(d => d !== ALL).map(d => {
                  const colors = DOMAIN_COLORS[d] || DOMAIN_COLORS['General'];
                  const count = domainCounts[d] || 0;
                  return (
                    <button
                      key={d}
                      onClick={() => setDomain(domain === d ? ALL : d)}
                      className={`mmp-domain-pill ${domain === d ? 'mmp-domain-active' : ''}`}
                    >
                      <span className={`mmp-domain-dot ${colors.dot}`} />
                      <span>{d}</span>
                      <span className="mmp-domain-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Filter & Sort Bar ─────────────────────────────── */}
          <section className="mmp-toolbar">
            <div className="mmp-toolbar-left">
              <div className="mmp-select-wrap">
                <select value={price} onChange={e => setPrice(e.target.value as PriceFilter)} className="mmp-select">
                  {PRICE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="mmp-select-chevron" />
              </div>
              <div className="mmp-select-wrap">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="mmp-select">
                  {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="mmp-select-chevron" />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(v => !v)}
                className={`mmp-filter-toggle ${showFilters || activeCount > 0 ? 'mmp-filter-active' : ''}`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && <span className="mmp-filter-badge">{activeCount}</span>}
              </button>
            </div>
            <div className="mmp-toolbar-right">
              {activeCount > 0 && (
                <button type="button" onClick={clearFilters} className="mmp-clear-btn">
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
              <div className="mmp-results-label">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>{sorted.length} mentor{sorted.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </section>

          {/* Filter Expand */}
          <AnimatePresence>
            {showFilters && (
              <motion.section
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mmp-filter-expanded">
                  <p className="mmp-filter-expanded-label">Quick Filters</p>
                  <div className="mmp-filter-chips">
                    <button type="button" onClick={() => setSortBy('rating')} className="mmp-filter-chip">
                      <Star className="h-3.5 w-3.5 text-amber-500" /> Top rated mentors
                    </button>
                    <button type="button" onClick={() => setPrice('free')} className="mmp-filter-chip">
                      <Zap className="h-3.5 w-3.5 text-emerald-500" /> Free sessions
                    </button>
                    <button type="button" onClick={() => setPrice('under-499')} className="mmp-filter-chip">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Budget friendly
                    </button>
                    <button type="button" onClick={() => setSortBy('sessions')} className="mmp-filter-chip">
                      <Users className="h-3.5 w-3.5 text-purple-500" /> Most experienced
                    </button>
                    <button type="button" onClick={() => setSortBy('newest')} className="mmp-filter-chip">
                      <Sparkles className="h-3.5 w-3.5 text-pink-500" /> New mentors
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Recommended Mentors ─────────────────────────── */}
          {!loading && !error && isLoggedIn && sorted.length > 0 && search.trim() === '' && domain === ALL && price === 'all' && (
            <RecommendedMentors variant="marketplace" />
          )}

          {/* ── Content ──────────────────────────────────────── */}
          {loading ? (
            <div className="mmp-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="mmp-skeleton-card">
                  <div className="mmp-skeleton-header">
                    <div className="mmp-skeleton-avatar" />
                    <div className="mmp-skeleton-lines">
                      <div className="mmp-skeleton-line mmp-skeleton-line-md" />
                      <div className="mmp-skeleton-line mmp-skeleton-line-sm" />
                    </div>
                  </div>
                  <div className="mmp-skeleton-stats">
                    <div className="mmp-skeleton-stat" />
                    <div className="mmp-skeleton-stat" />
                    <div className="mmp-skeleton-stat" />
                  </div>
                  <div className="mmp-skeleton-line mmp-skeleton-line-full" />
                  <div className="mmp-skeleton-line mmp-skeleton-line-lg" />
                  <div className="mmp-skeleton-tags">
                    <div className="mmp-skeleton-tag" />
                    <div className="mmp-skeleton-tag mmp-skeleton-tag-lg" />
                  </div>
                  <div className="mmp-skeleton-footer">
                    <div className="mmp-skeleton-btn" />
                    <div className="mmp-skeleton-btn mmp-skeleton-btn-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mmp-error">
              <div className="mmp-error-inner">
                <div className="mmp-error-icon-wrap">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="mmp-error-content">
                  <h3 className="mmp-error-title">Could not load mentors</h3>
                  <p className="mmp-error-desc">{error}</p>
                </div>
                <button type="button" onClick={refresh} className="mmp-error-retry">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          ) : sorted.length === 0 ? (
            <div className="mmp-empty">
              <div className="mmp-empty-icon">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="mmp-empty-title">No mentors match your criteria</h2>
              <p className="mmp-empty-desc">
                Try adjusting your filters or search terms to find the right mentor for you.
              </p>
              <button type="button" onClick={clearFilters} className="mmp-empty-clear">
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="mmp-results-header">
                <p className="mmp-results-showing">
                  Showing <strong>{sorted.length}</strong> of {Math.max(totalCount, cards.length)} mentors
                </p>
                <div className="mmp-sort-indicator">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  Sorted by {SORT_OPTS.find(o => o.value === sortBy)?.label}
                </div>
              </div>

              {/* Cards Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mmp-grid"
              >
                {sorted.map((m, i) => (
                  <MentorMarketplaceCard key={m.id} mentor={m} isLoggedIn={isLoggedIn} priority={i < 4} />
                ))}
              </motion.div>

              {/* Load More */}
              {hasMore && (
                <div className="mmp-loadmore">
                  <div className="mmp-loadmore-inner">
                    <div>
                      <p className="mmp-loadmore-title">Discover more mentors</p>
                      <p className="mmp-loadmore-desc">
                        Load the next batch of {PAGE_SIZE} profiles to expand your options.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={!hasMore || loadingMore}
                      className="mmp-loadmore-btn"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load more
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-slate-900" /></div>}>
        <MentorsContent />
      </Suspense>
    </ProtectedRoute>
  );
}

// ─── Scoped Styles ──────────────────────────────────────────────────────────
const mentorPageStyles = `
/* ─── Page Layout ────────────────────────────────────────── */
.mmp-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 40%);
  padding-bottom: 64px;
}
.mmp-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─── Hero Section ───────────────────────────────────────── */
.mmp-hero {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: white;
  border: 1px solid #e8ebef;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.03);
}
.mmp-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(16,185,129,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.04) 0%, transparent 50%);
  pointer-events: none;
}
.mmp-hero-content {
  position: relative;
  display: grid;
  gap: 32px;
  padding: 32px 28px;
}
@media (min-width: 1024px) {
  .mmp-hero-content {
    grid-template-columns: 1.15fr 0.85fr;
    padding: 40px 36px;
  }
}

/* Hero Left */
.mmp-hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.mmp-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  width: fit-content;
  letter-spacing: 0.02em;
}
.mmp-hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin-top: 12px;
}
@media (min-width: 640px) {
  .mmp-hero-title { font-size: 40px; }
}
.mmp-hero-title-accent {
  background: linear-gradient(135deg, #10b981, #0d9488);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.mmp-hero-desc {
  margin-top: 12px;
  max-width: 540px;
  font-size: 15px;
  line-height: 1.7;
  color: #64748b;
}

/* Hero Stats */
.mmp-hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.mmp-stat {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mmp-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}
.mmp-stat-icon-green {
  background: #ecfdf5;
  color: #10b981;
}
.mmp-stat-icon-amber {
  background: #fffbeb;
  color: #f59e0b;
}
.mmp-stat-icon-blue {
  background: #eff6ff;
  color: #3b82f6;
}
.mmp-stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.mmp-stat-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 2px;
}
.mmp-stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}
@media (max-width: 480px) {
  .mmp-stat-divider { display: none; }
  .mmp-hero-stats { gap: 14px; }
}

/* ─── Search Panel ───────────────────────────────────────── */
.mmp-search-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(145deg, #fafbfc, #f5f7f9);
  border: 1px solid #e8ebef;
}
.mmp-search-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mmp-search-panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}
.mmp-refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mmp-refresh-btn:hover {
  border-color: #cbd5e1;
  color: #1e293b;
  background: #f8fafc;
}

/* Search Input */
.mmp-search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  transition: all 0.25s ease;
}
.mmp-search-focused {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
}
.mmp-search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}
.mmp-search-input {
  width: 100%;
  height: 48px;
  padding: 0 44px 0 42px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  background: transparent;
  border: none;
  outline: none;
}
.mmp-search-input::placeholder {
  color: #94a3b8;
}
.mmp-search-clear {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s;
}
.mmp-search-clear:hover {
  background: #e2e8f0;
}

/* Quick Stats */
.mmp-quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mmp-quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 8px;
  border-radius: 12px;
  background: white;
  border: 1px solid #f1f5f9;
}
.mmp-quick-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.mmp-quick-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ─── Domain Categories ──────────────────────────────────── */
.mmp-domains-section {
  overflow: hidden;
}
.mmp-domains-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.mmp-domains-scroll::-webkit-scrollbar { display: none; }
.mmp-domain-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #e8ebef;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.mmp-domain-pill:hover {
  border-color: #10b981;
  color: #059669;
  background: #ecfdf5;
}
.mmp-domain-active {
  background: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
}
.mmp-domain-active .mmp-domain-count {
  background: rgba(255,255,255,0.2) !important;
  color: white !important;
}
.mmp-domain-active .mmp-domain-dot {
  background: #34d399 !important;
}
.mmp-domain-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mmp-domain-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
}

/* ─── Toolbar ────────────────────────────────────────────── */
.mmp-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e8ebef;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.mmp-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.mmp-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mmp-select-wrap {
  position: relative;
  min-width: 150px;
}
@media (max-width: 640px) {
  .mmp-select-wrap { min-width: 120px; flex: 1; }
}
.mmp-select {
  width: 100%;
  height: 40px;
  appearance: none;
  padding: 0 32px 0 14px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}
.mmp-select:focus {
  border-color: #10b981;
  background: white;
}
.mmp-select-chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  pointer-events: none;
}
.mmp-filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  transition: all 0.2s ease;
}
.mmp-filter-toggle:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.mmp-filter-active {
  background: #0f172a !important;
  border-color: #0f172a !important;
  color: white !important;
}
.mmp-filter-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,0.2);
}
.mmp-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mmp-clear-btn:hover {
  background: #fee2e2;
}
.mmp-results-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* ─── Filter Expanded ────────────────────────────────────── */
.mmp-filter-expanded {
  padding: 16px 20px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e8ebef;
}
.mmp-filter-expanded-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 10px;
}
.mmp-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mmp-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mmp-filter-chip:hover {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

/* ─── Grid ───────────────────────────────────────────────── */
.mmp-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
}
@media (min-width: 768px) {
  .mmp-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1280px) {
  .mmp-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1536px) {
  .mmp-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ─── Results Header ─────────────────────────────────────── */
.mmp-results-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mmp-results-showing {
  font-size: 14px;
  color: #64748b;
}
.mmp-results-showing strong {
  color: #0f172a;
  font-weight: 700;
}
.mmp-sort-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding: 6px 14px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

/* ─── Load More ──────────────────────────────────────────── */
.mmp-loadmore {
  border-radius: 18px;
  border: 1px solid #e8ebef;
  background: white;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.mmp-loadmore-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.mmp-loadmore-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.mmp-loadmore-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}
.mmp-loadmore-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  background: #0f172a;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mmp-loadmore-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15,23,42,0.15);
}
.mmp-loadmore-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ─── Empty / Error States ───────────────────────────────── */
.mmp-error {
  border-radius: 18px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  padding: 24px;
}
.mmp-error-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.mmp-error-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  flex-shrink: 0;
}
.mmp-error-content {
  flex: 1;
  min-width: 200px;
}
.mmp-error-title {
  font-size: 16px;
  font-weight: 700;
  color: #7f1d1d;
}
.mmp-error-desc {
  font-size: 13px;
  color: #b91c1c;
  margin-top: 4px;
}
.mmp-error-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  background: #0f172a;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.mmp-error-retry:hover { background: #1e293b; }

.mmp-empty {
  border-radius: 18px;
  border: 2px dashed #cbd5e1;
  background: white;
  padding: 56px 24px;
  text-align: center;
}
.mmp-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f1f5f9;
  margin: 0 auto 20px;
}
.mmp-empty-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}
.mmp-empty-desc {
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  margin: 12px auto 0;
  line-height: 1.6;
}
.mmp-empty-clear {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  height: 42px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.mmp-empty-clear:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* ─── Skeleton ───────────────────────────────────────────── */
.mmp-skeleton-card {
  border-radius: 18px;
  border: 1px solid #f1f5f9;
  background: white;
  padding: 24px;
  animation: mmpPulse 2s ease-in-out infinite;
}
.mmp-skeleton-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.mmp-skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f5f9;
  flex-shrink: 0;
}
.mmp-skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mmp-skeleton-line {
  height: 10px;
  border-radius: 6px;
  background: #f1f5f9;
}
.mmp-skeleton-line-md { width: 65%; }
.mmp-skeleton-line-sm { width: 40%; }
.mmp-skeleton-line-full { width: 100%; margin-bottom: 8px; }
.mmp-skeleton-line-lg { width: 85%; margin-bottom: 14px; }
.mmp-skeleton-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.mmp-skeleton-stat {
  height: 48px;
  border-radius: 10px;
  background: #f8fafc;
}
.mmp-skeleton-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.mmp-skeleton-tag {
  height: 26px;
  width: 64px;
  border-radius: 8px;
  background: #f1f5f9;
}
.mmp-skeleton-tag-lg { width: 80px; }
.mmp-skeleton-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid #f8fafc;
}
.mmp-skeleton-btn {
  height: 42px;
  border-radius: 10px;
  background: #f1f5f9;
}
.mmp-skeleton-btn-primary {
  background: #e8ebef;
}

@keyframes mmpPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`;
