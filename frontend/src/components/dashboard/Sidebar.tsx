'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  UserCircle, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear local storage if any auth data is stored there
        localStorage.removeItem('user'); 
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Mentors', href: '/student/mentors', icon: Users },
    { name: 'Assessments', href: '/student/assessments', icon: ClipboardCheck },
    { name: 'Profile', href: '/student/profile', icon: UserCircle },
    { name: 'Settings', href: '/student/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low z-40 flex flex-col pt-24 pb-10">
      <div className="flex flex-col h-full px-6">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-full transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container' 
                    : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} strokeWidth={2} className={isActive ? 'text-on-primary-container' : 'group-hover:text-primary transition-colors'} />
                  <span className="text-[14px] font-medium font-inter">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant rounded-full hover:bg-surface-bright transition-colors font-inter text-[14px] font-medium"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
