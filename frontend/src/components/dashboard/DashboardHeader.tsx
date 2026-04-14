/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @next/next/no-html-link-for-pages, @typescript-eslint/no-unused-vars, @next/next/no-img-element, react/no-unescaped-entities */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User, MessageSquare, Calendar, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { apiClient } from '@/utils/api-client';


import { getImageUrl } from '@/utils/imageUrl';
interface HeaderProps {
  userName?: string;
  onMenuClick: () => void;
}

interface BookingNotificationItem {
  id: string;
  type: 'meeting' | 'message';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface StudentBooking {
  _id: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  date: string;
  startTime: string;
  endTime: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
  mentor?: {
    name?: string;
  };
}

const toRelativeTime = (isoDate?: string) => {
  if (!isoDate) return 'just now';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'just now';

  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const actionButtonClasses =
  'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm';

const DashboardHeader = ({
  userName = 'Student Dashboard',
  onMenuClick,
}: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<BookingNotificationItem[]>([]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const router = useRouter();
  const { user, logout } = useAuth();

  const resolvedDisplayName = user?.name?.trim() || userName;
  const avatarLetter = resolvedDisplayName.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStudentNotifications = async () => {
      if (user?.role !== 'student') return;

      const response = await apiClient.get<{ bookings: StudentBooking[] }>('/api/v1/bookings/my-bookings?limit=25');
      if (!response.success || !response.data?.bookings) return;

      const derived = response.data.bookings
        .filter((booking) => ['rejected', 'confirmed', 'in-progress'].includes(booking.status))
        .map((booking): BookingNotificationItem => {
          const mentorName = booking.mentor?.name || 'your mentor';

          if (booking.status === 'rejected') {
            const defaultRejection =
              'Your requested session was declined by the mentor. Please choose another available slot.';
            return {
              id: `${booking._id}-rejected`,
              type: 'message',
              title: 'Session request declined',
              message: `${mentorName} declined your request. ${booking.cancellationReason || defaultRejection}`,
              time: toRelativeTime(booking.updatedAt || booking.createdAt),
              unread: true,
            };
          }

          return {
            id: `${booking._id}-${booking.status}`,
            type: 'meeting',
            title: booking.status === 'in-progress' ? 'Session in progress' : 'Session confirmed',
            message: `${mentorName} has ${booking.status === 'in-progress' ? 'started' : 'accepted'} your session on ${new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${booking.startTime}.`,
            time: toRelativeTime(booking.updatedAt || booking.createdAt),
            unread: true,
          };
        })
        .sort((left, right) => {
          const leftId = left.id;
          const rightId = right.id;
          return rightId.localeCompare(leftId);
        });

      setNotifications(derived.slice(0, 10));
    };

    fetchStudentNotifications();
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      router.push('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'mentor') {
        router.push(`/mentor/sessions?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push(`/student/mentors?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/50 bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(16,185,129,0.03)]">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-50 lg:hidden shadow-sm"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
            Workspace
          </p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[32px]">
            {userName}
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative hidden w-full max-w-sm md:block">
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
            <Search size={17} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors or sessions"
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </form>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <button 
              type="button" 
              className={actionButtonClasses} 
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-sm border border-emerald-600"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-90 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${notification.unread ? 'bg-emerald-50/40' : ''}`}>
                          <div className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                            notification.type === 'meeting' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {notification.type === 'meeting' && <Calendar size={14} />}
                            {notification.type === 'message' && <MessageSquare size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notification.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                  <button className="w-full py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 text-center transition-colors rounded-lg hover:bg-gray-200/50">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-green-500 text-sm font-bold text-slate-900 hover:from-emerald-500 hover:to-green-600 transition-colors sm:flex shadow-sm shadow-emerald-500/20"
              aria-label="Profile menu"
            >
               {user?.profileImage ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <img
                    src={getImageUrl(user.profileImage, user.name, 300, user.profileImageUpdatedAt)}
                    alt={`${resolvedDisplayName} profile`}
                    className="h-full w-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImageUrl("", user.name);
                      }}
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
