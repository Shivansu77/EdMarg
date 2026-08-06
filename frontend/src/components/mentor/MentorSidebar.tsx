'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/utils/api-client';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/common/Logo';
import {
  LayoutGrid,
  Calendar,
  Users,
  ChevronLeft,
  History,
  Video,
  CalendarCheck,
  Settings,
  LogOut,
  BarChart3,
} from 'lucide-react';

interface MentorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: LayoutGrid },
  { name: 'Requests', href: '/mentor/requests', icon: CalendarCheck },
  { name: 'Schedule', href: '/mentor/schedule', icon: Calendar },
  { name: 'Students', href: '/mentor/students', icon: Users },
  { name: 'Results', href: '/mentor/results', icon: BarChart3 },
  { name: 'History', href: '/mentor/history', icon: History },
  { name: 'Recordings', href: '/mentor/recordings', icon: Video },
  { name: 'Settings', href: '/mentor/settings', icon: Settings },
];

const MentorSidebar = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapsed,
}: MentorSidebarProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
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
    ? navItems.filter((item) => item.href === '/mentor/settings')
    : navItems;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Header */}
        <div className={`flex h-16 items-center border-b border-slate-200 ${isCollapsed ? 'justify-center px-4' : 'justify-between px-6'}`}>
          {!isCollapsed && (
            <Logo imgClassName="h-8 w-auto" />
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          {!isCollapsed && (
            <div className="mb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </p>
            </div>
          )}

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
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

export default MentorSidebar;
