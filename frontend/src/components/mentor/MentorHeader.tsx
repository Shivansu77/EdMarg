'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, MessageSquare, FileText, Calendar, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';


import { getImageUrl } from '@/utils/imageUrl';
interface MentorHeaderProps {
  onMenuClick: () => void;
}

const MentorHeader = ({ onMenuClick }: MentorHeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'meeting', title: 'New Session Request', message: 'You have a new session request from Alex.', time: '1 hour ago', unread: true },
    { id: 2, type: 'message', title: 'New Message from Student', message: "Thanks for the session yesterday. I have a quick question.", time: '4 hours ago', unread: true },
    { id: 3, type: 'assignment', title: 'Assessment Result Completed', message: "David just completed their mock interview coding test.", time: '1 day ago', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

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
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Overview
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {displayName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationsRef}>
            <button 
              type="button" 
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100"
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
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
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
                        <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${notification.unread ? 'bg-purple-500/5' : ''}`}>
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
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
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

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Mentor</p>
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-10 w-10 rounded-full bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 transition-colors flex items-center justify-center"
                aria-label="Profile menu"
              >
                {user?.profileImage ? (
                  <div className="relative h-full w-full rounded-full overflow-hidden">
                    <img
                      src={getImageUrl(user.profileImage, user.name)}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push('/mentor/profile');
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
      </div>
    </header>
  );
};

export default MentorHeader;
