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
  Heart,
  LogOut,
  Sparkles,
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
  { name: 'Book Session', href: '/student/booking', icon: CalendarCheck },
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
  { name: 'Platform Stats', href: '/admin/bookings', icon: BadgeCheck },
];

const Sidebar = ({ isOpen, onClose, side, isCollapsed = false, onToggleCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isRightSide = side === 'right';
  
  const navItems =
    user?.role === 'admin' ? adminNavItems : user?.role === 'mentor' ? mentorNavItems : studentNavItems;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-all duration-500 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 z-50 flex h-full flex-col border-r border-white/40 bg-white/40 backdrop-blur-3xl transition-all duration-500 ease-in-out lg:static ${
          isRightSide
            ? `right-0 border-l border-r-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`
        } ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/40 px-6">
          <div className={`transition-all duration-300 ${isCollapsed ? 'scale-0 opacity-0 w-0' : 'scale-100 opacity-100'}`}>
            <Logo imgClassName="h-10 w-auto" />
          </div>
          <button
            onClick={onToggleCollapsed}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60 text-slate-400 border border-white/80 shadow-sm transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 custom-scrollbar">
          <div className="space-y-1.5">
            <p className={`mb-4 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/5'
                      : 'text-slate-500 hover:bg-white/80 hover:text-emerald-600 hover:shadow-sm'
                  }`}
                >
                  <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'rotate-3 scale-110' : 'group-hover:scale-110'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {!isCollapsed && (
            <div className="mt-auto px-2">
              <div className="rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-sm ring-1 ring-black/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Premium Pro</p>
                    <p className="text-[10px] font-bold text-slate-500">Unlimited sessions</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/40 p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
