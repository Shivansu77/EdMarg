'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarCheck,
  ClipboardCheck,
  Film,
  History,
  BadgeCheck,
  LayoutGrid,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Briefcase,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/common/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const studentNavGroups = [
  {
    group: 'Learning',
    items: [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
      { name: 'Assessments', href: '/student/assessments', icon: ClipboardCheck },
      { name: 'Results', href: '/student/results', icon: BadgeCheck },
    ]
  },
  {
    group: 'Mentorship',
    items: [
      { name: 'Find Mentors', href: '/student/mentors', icon: Users },
      { name: 'Become a Mentor', href: '/student/careers', icon: Briefcase },
      { name: 'Book Session', href: '/student/booking', icon: CalendarCheck },
      { name: 'Schedule', href: '/student/schedule', icon: CalendarDays },
    ]
  },
  {
    group: 'Resources',
    items: [
      { name: 'Recordings', href: '/student/recordings', icon: Film },
      { name: 'History', href: '/student/history', icon: History },
    ]
  },
  {
    group: 'Account',
    items: [
      { name: 'Settings', href: '/student/settings', icon: Settings },
    ]
  }
];

const mentorNavGroups = [
  {
    group: 'Platform',
    items: [
      { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutGrid },
      { name: 'Requests', href: '/mentor/requests', icon: CalendarCheck },
      { name: 'Schedule', href: '/mentor/schedule', icon: CalendarDays },
      { name: 'Students', href: '/mentor/students', icon: Users },
    ]
  },
  {
    group: 'Account',
    items: [
      { name: 'Settings', href: '/mentor/settings', icon: Settings },
    ]
  }
];

const adminNavGroups = [
  {
    group: 'Platform',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck },
      { name: 'Platform Stats', href: '/admin/bookings', icon: BadgeCheck },
    ]
  }
];

const Sidebar = ({ isOpen, onClose, side, isCollapsed = false, onToggleCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isRightSide = side === 'right';
  
  const navGroups =
    user?.role === 'admin' ? adminNavGroups : user?.role === 'mentor' ? mentorNavGroups : studentNavGroups;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:static ${
          isRightSide
            ? `right-0 border-l border-r-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`flex h-16 items-center border-b border-slate-200 ${isCollapsed ? 'justify-center px-4' : 'justify-between px-6'}`}>
          {!isCollapsed && (
            <Logo imgClassName="h-8 w-auto" />
          )}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={groupIndex > 0 ? 'mt-6' : ''}>
              {!isCollapsed && (
                <div className="mb-2 px-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {group.group}
                  </p>
                </div>
              )}
              {isCollapsed && groupIndex > 0 && (
                <div className="my-3 h-px bg-slate-200" />
              )}
              
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-all hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
