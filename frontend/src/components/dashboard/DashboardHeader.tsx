'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User, MessageSquare, Calendar, Check, Settings, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import Link from 'next/link';
import AppImage from '@/components/AppImage';
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
      router.push('/login');
    } catch (e) {
      console.error('Logout failed:', e);
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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 lg:hidden shadow-xs"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {userName}
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative hidden w-full max-w-sm md:block">
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
            <Search size={16} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors or sessions..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </form>

        <div className="flex items-center gap-2">
          {user?.role === 'student' && (
            <Link 
              href="/student/wishlist" 
              className={actionButtonClasses}
              aria-label="Wishlist"
            >
              <Heart size={18} className="text-slate-600" />
            </Link>
          )}

          <div className="relative" ref={notificationsRef}>
            <button 
              type="button" 
              className={actionButtonClasses} 
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      <Bell size={22} className="mx-auto mb-2 opacity-30 text-slate-400" />
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            router.push('/student/schedule');
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${notification.unread ? 'bg-slate-50/80' : ''}`}
                        >
                          <div className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                            notification.type === 'meeting' ? 'bg-slate-100 text-slate-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {notification.type === 'meeting' && <Calendar size={14} />}
                            {notification.type === 'message' && <MessageSquare size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${notification.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      router.push('/student/schedule');
                    }}
                    className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 text-center transition-colors rounded-md hover:bg-slate-100"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors sm:flex shadow-xs"
              aria-label="Profile menu"
            >
               {user?.profileImage ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <AppImage
                    src={getImageUrl(user.profileImage, user.name, 300, user.profileImageUpdatedAt)}
                    alt={`${resolvedDisplayName} profile`}
                    fill
                    fallbackName={user.name}
                    className="object-cover object-top"
                  />
                </div>
              ) : (
                avatarLetter
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{resolvedDisplayName}</p>
                  <p className="text-xs text-gray-500 font-semibold capitalize">{user?.role || 'Student'}</p>
                </div>
                <button
                  onClick={() => {
                    router.push(`/${user?.role || 'student'}/settings#profile`);
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-slate-400" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    router.push(`/${user?.role || 'student'}/settings`);
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
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
