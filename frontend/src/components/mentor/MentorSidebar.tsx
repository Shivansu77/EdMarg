'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/utils/api-client';
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
  ChevronRight,
  History,
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
  { name: 'History', href: '/mentor/history', icon: History },
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
  const [isRestrictedMentor, setIsRestrictedMentor] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadApprovalStatus = async () => {
      const res = await apiClient.get<{ mentorProfile?: { approvalStatus?: string } }>('/api/v1/users/me');
      if (!isMounted || !res.success) {
        return;
      }

      const approvalStatus = res.data?.mentorProfile?.approvalStatus || 'pending';
      setIsRestrictedMentor(approvalStatus !== 'approved');
    };

    void loadApprovalStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleNavItems = isRestrictedMentor
    ? navItems.filter((item) => item.href === '/mentor/profile')
    : navItems;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 pb-4 pt-4 shadow-sm transition-all duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 mb-6 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isCollapsed && (
            <Link href="/" onClick={onClose} className="group block">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black text-xs font-extrabold text-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                  E
                </span>
                <span className="text-xl font-extrabold tracking-tight text-black">EdMarg</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1 pl-1">
                Mentor Hub
              </p>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {/* Close button — mobile only */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>

            {/* Collapse button — desktop only */}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft
                size={16}
                className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex h-full flex-col px-2 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-2 mb-4">
              Navigation
            </p>
          )}

          <nav className="space-y-1 flex-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                    isActive
                      ? 'bg-gray-100 text-black font-bold border border-gray-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold border border-transparent'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors duration-300 ${
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>
                        {item.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className={`transition-all duration-200 ${
                          isActive
                            ? 'text-black opacity-100'
                            : 'text-slate-400 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Pro tip card */}
          {!isCollapsed && !isRestrictedMentor && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mt-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-black" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">
                  Mentor Tip
                </p>
              </div>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                Keep your schedule up to date
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 font-medium">
                Update your availability weekly so students can always find and book sessions with you.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default MentorSidebar;
