'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export const useWishlist = () => {
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
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (mentorId: string) => {
    if (!user) {
      toast.error('Please log in to wishlist mentors');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can wishlist mentors');
      return;
    }

    try {
      const res = await apiClient.post<any>(`/api/v1/wishlist/toggle/${mentorId}`);
      if (res.success) {
        if ((res as any).action === 'added') {
          setWishlistIds(prev => [...prev, mentorId]);
          toast.success('Added to wishlist');
        } else {
          setWishlistIds(prev => prev.filter(id => id !== mentorId));
          toast.success('Removed from wishlist');
        }
      } else {
        toast.error(res.message || 'Failed to update wishlist');
      }
    } catch (error) {
      toast.error('Error updating wishlist');
    }
  };

  const isWishlisted = (mentorId: string) => wishlistIds.includes(mentorId);

  return { wishlistIds, loading, toggleWishlist, isWishlisted, fetchWishlist };
};
