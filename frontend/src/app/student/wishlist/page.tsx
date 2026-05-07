'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import MentorMarketplaceCard from '@/components/mentors/MentorMarketplaceCard';
import { apiClient } from '@/utils/api-client';
import { useAuth } from '@/context/AuthContext';

export default function WishlistPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any[]>('/api/v1/wishlist');
      if (res.success) {
        setMentors(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch wishlist');
      }
    } catch (err) {
      setError('An error occurred while fetching your wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      <DashboardLayout userName="Wishlist">
        <div className="min-h-screen pb-16">
          <div className="space-y-6">
            {/* Hero Section */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="px-6 py-8 lg:px-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <Heart size={20} className="fill-current" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-600">My Favorites</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">Wishlisted Mentors</h1>
                  </div>
                </div>
                <p className="max-w-2xl text-slate-600">
                  Keep track of the mentors you're interested in. You can easily connect with them later when you're ready for a session.
                </p>
              </div>
            </section>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="mt-4 text-slate-500 font-medium">Loading your wishlist...</p>
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
                <button 
                  onClick={fetchWishlist}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : mentors.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/90 p-20 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6">
                  <Heart size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-950 mb-2">Your wishlist is empty</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Browse our community of expert mentors and save your favorites to find them easily later.
                </p>
                <Link 
                  href="/student/mentors"
                  className="inline-flex items-center justify-center px-8 py-3 bg-slate-950 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  Explore Mentors
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {mentors.map((m) => {
                  // Transform API data to card data format
                  const cardData = {
                    id: m._id,
                    name: m.name,
                    profileImage: m.profileImage,
                    roleTitle: m.mentorProfile?.expertise?.[0] ? `${m.mentorProfile.expertise[0]} Mentor` : 'Industry Expert',
                    bio: m.mentorProfile?.bio || '',
                    skills: m.mentorProfile?.expertise || [],
                    rating: m.mentorProfile?.rating || 0,
                    reviewCount: m.mentorProfile?.totalSessions || 0,
                    experienceYears: m.mentorProfile?.experienceYears || 0,
                    sessionCount: m.mentorProfile?.totalSessions || 0,
                    price: m.mentorProfile?.pricePerSession || 0,
                    isVerified: true,
                    sessionDuration: m.mentorProfile?.sessionDuration || 45,
                    currentCompany: m.mentorProfile?.currentCompany,
                    currentTitle: m.mentorProfile?.currentTitle
                  };

                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MentorMarketplaceCard 
                        mentor={cardData} 
                        isLoggedIn={true} 
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
