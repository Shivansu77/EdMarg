'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { Search, Loader2, Filter, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import MentorHorizontalCard from '@/components/mentors/MentorHorizontalCard';
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
    totalSessions?: number;
  };
};

const API_BASE_URL = resolveApiBaseUrl();

function ExploreContent() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const fetchMentors = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/browsementor?page=${pageNum}&limit=10`,
        createAuthenticatedRequestInit({ method: 'GET' })
      );

      if (!response.ok) {
        throw new Error('Failed to fetch mentors');
      }

      const result = await response.json();
      setMentors(result.data || []);
      setTotalPages(result.pages || 1);
      setTotalCount(result.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors(page);
  }, [page, fetchMentors]);

  return (
    <DashboardLayout userName="Marketplace">
      <div className="min-h-screen bg-[#FDFBF7] pb-24">
        {/* Header Section - Clean Modern Minimalist */}
        <section className="relative pt-12 pb-20 px-6 lg:px-12 text-center max-w-5xl mx-auto">
          <div className="inline-block px-5 py-1.5 bg-gray-100 text-gray-400 rounded-full text-[10px] font-black tracking-[0.4em] uppercase mb-6 border border-gray-200">
            Discovery Hub
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none">
            Meet your next <br className="hidden lg:block" /> 
            <span className="text-gray-400 italic">Industry Expert.</span>
          </h1>
          <p className="mt-8 text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed border-l-2 border-gray-100 pl-8 inline-block text-left">
            Browse our curated list of industry leaders ready to help you build your perfect career trajectory.
          </p>

          {/* Search Bar */}
          <div className="mt-16 relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-300 group-focus-within:text-slate-900 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by role, company, or expertise..."
              className="w-full pl-16 pr-24 py-6 bg-white rounded-3xl text-lg font-medium border border-gray-100 shadow-xl shadow-slate-900/5 focus:outline-none focus:border-slate-400 transition-all placeholder:text-gray-300"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
               <button className="bg-black text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg">
                 Search
               </button>
            </div>
          </div>
        </section>

        {/* Filters/Results Header */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-10 flex flex-wrap items-center justify-between gap-6">
          <div className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.5em]">
            Showing <span className="text-black font-black">{mentors.length}</span> of <span className="text-black font-black">{totalCount}</span> mentors
          </div>
          
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-100 rounded-2xl text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm">
               <Filter size={14} />
               Filter
             </button>
             <button
               onClick={() => fetchMentors(page)}
               className="p-3.5 bg-white border border-gray-100 rounded-2xl text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
               title="Refresh"
             >
               <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-10">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-6">
               <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
               <p className="font-black text-gray-300 tracking-[0.4em] uppercase text-[10px]">Assembling catalogue...</p>
             </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                 <AlertCircle size={32} className="text-red-500" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">Sync Error</h3>
               <p className="text-red-700 font-medium mb-8 leading-relaxed italic">{error}</p>
               <button 
                 onClick={() => fetchMentors(page)}
                 className="px-12 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                 Reconnect
               </button>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[40px] bg-white">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No results available</h3>
               <p className="mt-4 text-gray-400 font-medium text-lg">Try broadening your search or adjusting your filters.</p>
            </div>
          ) : (
            <>
              {mentors.map((mentor) => (
                <MentorHorizontalCard 
                  key={mentor._id} 
                  mentor={mentor} 
                  isLoggedIn={isLoggedIn}
                />
              ))}

              {/* Pagination */}
              <div className="pt-12 flex items-center justify-center gap-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="w-14 h-14 rounded-full border border-gray-100 bg-white flex items-center justify-center text-slate-900 hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="bg-white border border-gray-100 px-10 py-4 rounded-full font-black text-slate-900 shadow-sm tracking-[0.3em] text-[10px] uppercase">
                   Page {page} of {totalPages}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="w-14 h-14 rounded-full border border-gray-100 bg-white flex items-center justify-center text-slate-900 hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ExplorePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        </div>
      }>
        <ExploreContent />
      </Suspense>
    </ProtectedRoute>
  );
}
