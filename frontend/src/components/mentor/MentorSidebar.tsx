'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  User,
  Settings,
  X,
  ChevronLeft,
  Zap,
} from 'lucide-react';

interface MentorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutGrid },
  { name: 'Requests', href: '/mentor/requests', icon: MessageSquare },
  { name: 'Schedule', href: '/mentor/schedule', icon: Calendar },
  { name: 'Students', href: '/mentor/students', icon: Users },
  { name: 'Results', href: '/mentor/results', icon: BarChart3 },
  { name: 'Profile', href: '/mentor/profile', icon: User },
  { name: 'Settings', href: '/mentor/settings', icon: Settings },
];

const MentorSidebar = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapsed,
}: MentorSidebarProps) => {
  const pathname = usePathname();

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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-6 border-b border-gray-200 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isCollapsed && (
            <div>
              <p className="text-lg font-bold text-gray-900">Edmarg</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">
                Career Curator
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>

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
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
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
                    ? 'bg-purple-100 text-purple-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                {!isCollapsed && (
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-purple-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900">
                  Pro Mentor Plan
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                  <div className="h-full w-[65%] rounded-full bg-purple-600" />
                </div>
                <p className="text-xs text-purple-700">65% storage used</p>
              </div>
              <button className="w-full text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Upgrade Storage →
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default MentorSidebar;
