'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  Film,
  History,
  BadgeCheck,
  FileText,
  LayoutGrid,
  UserCircle,
  Users,
  X,
  ChevronLeft,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const studentNavItems = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
  { name: 'Assessments', href: '/student/assessments', icon: ClipboardCheck },
  { name: 'Results', href: '/student/results', icon: BadgeCheck },
  { name: 'Mentors', href: '/student/mentors', icon: Users },
  { name: 'Book Session', href: '/student/mentors', icon: CalendarCheck },
  { name: 'Schedule', href: '/student/schedule', icon: CalendarDays },
  { name: 'History', href: '/student/history', icon: History },
  { name: 'Recordings', href: '/student/recordings', icon: Film },
  { name: 'Profile', href: '/student/profile', icon: UserCircle },
];

const mentorNavItems = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutGrid },
  { name: 'Requests', href: '/mentor/requests', icon: CalendarCheck },
  { name: 'Schedule', href: '/mentor/schedule', icon: CalendarDays },
  { name: 'Students', href: '/mentor/students', icon: Users },
  { name: 'Profile', href: '/mentor/profile', icon: UserCircle },
];

const adminNavItems = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck },
  { name: 'Platform Stats', href: '/admin/dashboard', icon: BadgeCheck },
];

const Sidebar = ({ isOpen, onClose, side, isCollapsed = false, onToggleCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isRightSide = side === 'right';
  
  const navItems =
    user?.role === 'admin' ? adminNavItems : user?.role === 'mentor' ? mentorNavItems : studentNavItems;

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
            <div className="group block">
              <Logo imgClassName="h-8 w-auto" className="mb-0" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mt-1 pl-1">
                Workspace
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>

            {/* Collapse button for desktop */}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? 'bg-emerald-50/80 text-emerald-900 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors duration-300 ${
                      isActive
                        ? 'bg-linear-to-br from-emerald-400 to-green-500 text-slate-900 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.name}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isActive ? 'text-emerald-700' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Workspace Tip */}
          {!isCollapsed && (
            <div className="rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-4 mt-auto shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Workspace Tip
              </p>
              <p className="mt-2 text-sm font-extrabold text-slate-900">
                Everything at your fingertips
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 font-medium">
                Move seamlessly between assessments, mentors, and your profile to manage your journey.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
