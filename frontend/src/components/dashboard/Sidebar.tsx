'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  History,
  BadgeCheck,
  LayoutGrid,
  UserCircle,
  Users,
  X,
  ChevronLeft,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const studentNavItems = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
  { name: 'Assessment', href: '/student/assessment', icon: ClipboardCheck },
  { name: 'Results', href: '/student/results', icon: BadgeCheck },
  { name: 'Mentors', href: '/student/mentors', icon: Users },
  { name: 'Booking', href: '/student/booking', icon: CalendarCheck },
  { name: 'Schedule', href: '/student/schedule', icon: CalendarDays },
  { name: 'History', href: '/student/history', icon: History },
  { name: 'Profile', href: '/student/profile', icon: UserCircle },
];

const mentorNavItems = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutGrid },
  { name: 'Requests', href: '/mentor/requests', icon: CalendarCheck },
  { name: 'Schedule', href: '/mentor/schedule', icon: CalendarDays },
  { name: 'Students', href: '/mentor/students', icon: Users },
  { name: 'Profile', href: '/mentor/profile', icon: UserCircle },
];

const Sidebar = ({ isOpen, onClose, side, isCollapsed = false, onToggleCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isRightSide = side === 'right';
  
  const navItems = user?.role === 'mentor' ? mentorNavItems : studentNavItems;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 z-50 flex flex-col bg-white border-r border-gray-200 pb-4 pt-4 shadow-sm backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:left-auto lg:right-auto lg:shadow-none ${
          isRightSide
            ? `right-0 border-l border-r-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 mb-6 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isCollapsed && (
            <div>
              <p className="text-lg font-bold text-gray-900">Edmarg</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">
                Career Curator
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>

            {/* Collapse button for desktop */}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft size={16} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex h-full flex-col px-2">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-2 mb-4">
              Navigation
            </p>
          )}

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      <ChevronRight
                        size={14}
                        className={`text-gray-400 transition-transform ${isActive ? 'text-gray-900' : ''}`}
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Workspace Tip */}
          {!isCollapsed && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mt-auto">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Workspace Tip
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                Keep your next step visible
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Move between assessments, mentors, bookings, and profile updates without losing your place.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
