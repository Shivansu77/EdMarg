'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface HeaderProps {
  userName?: string;
  onMenuClick: () => void;
}

const actionButtonClasses =
  'flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface';

const DashboardHeader = ({
  userName = 'Student Dashboard',
  onMenuClick,
}: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const resolvedDisplayName = user?.name?.trim() || userName;
  const avatarLetter = resolvedDisplayName.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[rgba(247,249,251,0.88)] backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Workspace
          </p>
          <h1 className="truncate text-2xl font-manrope font-extrabold tracking-[-0.03em] text-on-surface sm:text-[32px]">
            {userName}
          </h1>
        </div>

        <label className="relative hidden w-full max-w-sm md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={17} />
          <input
            type="text"
            placeholder="Search mentors or sessions"
            className="w-full rounded-full border border-black/5 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/25"
          />
        </label>

        <div className="flex items-center gap-2">
          <button type="button" className={actionButtonClasses} aria-label="Notifications">
            <Bell size={18} />
          </button>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary hover:bg-primary/90 transition-colors sm:flex"
              aria-label="Profile menu"
            >
               {user?.profileImage ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src={user.profileImage}
                    alt={`${resolvedDisplayName} profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                avatarLetter
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    router.push('/student/profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                >
                  <User size={16} />
                  View Profile
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
