'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, LogOut, User, MessageSquare, FileText, Calendar, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';


import { getImageUrl } from '@/utils/imageUrl';
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
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'assignment', title: 'New Assessment Assigned', message: 'You have a new Career Aptitude assessment to complete.', time: '2 hours ago', unread: true },
    { id: 2, type: 'meeting', title: 'Upcoming Mentor Meeting', message: 'Reminder: Session with your mentor starts in 30 mins.', time: '1 day ago', unread: true },
    { id: 3, type: 'message', title: 'New Message from Mentor', message: "Hey, I've reviewed your resume. Let's discuss it today.", time: '2 days ago', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const router = useRouter();
  const { user } = useAuth();

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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

        <form onSubmit={handleSearchSubmit} className="relative hidden w-full max-w-sm md:block">
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
            <Search size={17} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mentors or sessions"
            className="w-full rounded-full border border-black/5 bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary/25"
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
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${notification.unread ? 'bg-primary/5' : ''}`}>
                          <div className={`mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                            notification.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'meeting' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {notification.type === 'assignment' && <FileText size={14} />}
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
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
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
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary hover:bg-primary/90 transition-colors sm:flex"
              aria-label="Profile menu"
            >
               {user?.profileImage ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <img
                    src={getImageUrl(user.profileImage, user.name)}
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
