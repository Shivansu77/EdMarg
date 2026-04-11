/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/utils/api-client';
import Link from 'next/link';

export default function ProfileImageUpload() {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");

  useEffect(() => {
    // Load current user context
    async function fetchUser() {
      try {
        const response = await apiClient.get<any>('/api/v1/users/me');
        if (response.data) {
          setUserName(response.data.name);
          setUserRole(response.data.role);
          if (response.data.profileImage) {
            setImagePreview(`${API_URL}${response.data.profileImage}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
    fetchUser();
  }, [API_URL]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB) & type locally
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size is 2MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed.');
      return;
    }

    // 1. Show Instant Preview
    const objectUrl = URL.createObjectURL(file);
    const oldPreview = imagePreview;
    setImagePreview(objectUrl);

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setIsUploading(true);
      
      // Need standard fetch because apiClient specifically forces JSON usually
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/profile/update-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setImagePreview(`${API_URL}${result.profileImage}`);
        alert('Profile picture updated successfully!');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert(error.message || 'Image upload failed');
      setImagePreview(oldPreview); // revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  const displaySrc = imagePreview || '/images/default-avatar.png'; // Make sure you put a fallback

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative">
        <Link href={userRole === 'mentor' ? '/mentor/dashboard' : '/student/dashboard'} className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h2>
        <p className="text-gray-500 text-sm mb-8">Update your public avatar across EdMarg</p>
        
        <div className="relative inline-block mx-auto mb-6">
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative group">
            <img 
              src={displaySrc} 
              alt="Profile" 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                // If it fails to load the image, fallback to a color/text or blank
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${userName || 'User'}&background=e2e8f0&color=475569&size=160`;
              }}
            />
            {/* Overlay Upload Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {isUploading ? <Loader2 className="animate-spin text-white h-8 w-8" /> : <Camera className="text-white h-8 w-8" />}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">{userName || 'Loading...'}</h3>
        <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mt-1 mb-8">{userRole || 'User'}</p>

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <><Loader2 className="animate-spin h-5 w-5" /> Uploading...</>
          ) : (
            <><Camera className="h-5 w-5" /> Change Picture</>
          )}
        </button>
        <p className="mt-4 text-xs text-gray-400">JPG, PNG or WEBP. Max 2MB.</p>
      </div>
    </div>
  );
}
