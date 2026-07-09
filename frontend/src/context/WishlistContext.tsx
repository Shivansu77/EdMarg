'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface WishlistContextType {
  wishlistIds: string[];
  loading: boolean;
  toggleWishlist: (mentorId: string) => Promise<void>;
  isWishlisted: (mentorId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    
    try {
      setLoading(true);
      const res = await apiClient.get<any[]>('/api/v1/wishlist');
      if (res.success && res.data) {
        setWishlistIds(res.data.map((m: any) => m._id));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [user, fetchWishlist]);

  const toggleWishlist = async (mentorId: string) => {
    if (!user) {
      toast.error('Please log in to wishlist mentors');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can wishlist mentors');
      return;
    }

    // Optimistic update
    const prevWishlistIds = [...wishlistIds];
    const isAdded = !wishlistIds.includes(mentorId);
    
    if (isAdded) {
      setWishlistIds(prev => [...prev, mentorId]);
    } else {
      setWishlistIds(prev => prev.filter(id => id !== mentorId));
    }

    try {
      const res = await apiClient.post<any>(`/api/v1/wishlist/toggle/${mentorId}`);
      if (res.success) {
        if ((res as any).action === 'added') {
          toast.success('Added to wishlist');
        } else {
          toast.success('Removed from wishlist');
        }
      } else {
        // Revert on failure
        setWishlistIds(prevWishlistIds);
        toast.error(res.message || 'Failed to update wishlist');
      }
    } catch (error) {
      // Revert on failure
      setWishlistIds(prevWishlistIds);
      toast.error('Error updating wishlist');
    }
  };

  const isWishlisted = (mentorId: string) => wishlistIds.includes(mentorId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, loading, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlistContext must be used within WishlistProvider');
  return context;
};
