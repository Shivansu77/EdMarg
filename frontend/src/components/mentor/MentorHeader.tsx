/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
  Search,
  LogOut,
  User,
  MessageSquare,
  FileText,
  Calendar,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/utils/imageUrl';

interface MentorHeaderProps {
  onMenuClick: () => void;
}

const actionButtonClasses =
  'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm relative';

const MentorHeader = ({ onMenuClick }: MentorHeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'meeting',
      title: 'New Session Request',
      message: 'You have a new session request from Alex.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message from Student',
      message: "Thanks for the session yesterday. I have a quick question.",
      time: '4 hours ago',
      unread: true,
    },
    {
      id: 3,
      type: 'assignment',
      title: 'Assessment Result Completed',
      message: "David just completed their mock interview coding test.",
      time: '1 day ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const router = useRouter();
  const { user, logout } = useAuth();

  const displayName = user?.name?.trim() || 'Mentor';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'M';

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    } finally {
      router.push('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/mentor/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/50 bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(16,185,129,0.03)]">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-50 lg:hidden shadow-sm"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
            Mentor Hub
          </p>
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            Welcome back, {displayName}
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden w-full max-w-sm md:block">
          <button
            type="submit"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
          >
            <Search size={17} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students or sessions"
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className={actionButtonClasses}
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-sm border border-emerald-600" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() =>
                        setNotifications(notifications.map((n) => ({ ...n, unread: false })))
                      }
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Check size={14} />
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${
                            notification.unread ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div
                            className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${
                              notification.type === 'assignment'
                                ? 'bg-blue-100 text-blue-600'
                                : notification.type === 'meeting'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {notification.type === 'assignment' && <FileText size={14} />}
                            {notification.type === 'meeting' && <Calendar size={14} />}
                            {notification.type === 'message' && <MessageSquare size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                notification.unread
                                  ? 'font-bold text-slate-900'
                                  : 'font-medium text-slate-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <button className="w-full py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 text-center transition-colors rounded-lg hover:bg-slate-200/50">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-sm font-bold text-slate-900 hover:from-emerald-500 hover:to-green-600 transition-colors flex shadow-sm shadow-emerald-500/20"
              aria-label="Profile menu"
            >
              {user?.profileImage ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <img
                    src={getImageUrl(user.profileImage, user.name, 300, user.profileImageUpdatedAt)}
                    alt={`${displayName} profile`}
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getImageUrl('', user.name);
                    }}
                  />
                </div>
              ) : (
                avatarLetter
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Mentor</p>
                </div>
                <button
                  onClick={() => {
                    router.push('/mentor/profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-slate-400" />
                  View Profile
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

export default MentorHeader;
