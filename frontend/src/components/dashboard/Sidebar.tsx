'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ClipboardCheck,
  BadgeCheck,
  Users,
  CalendarCheck,
  CalendarDays,
  History,
  UserCircle,
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutGrid },
    { name: 'Assessment', href: '/student/assessment', icon: ClipboardCheck },
    { name: 'Results', href: '/student/results', icon: BadgeCheck },
    { name: 'Mentors', href: '/student/mentors', icon: Users },
    { name: 'Booking', href: '/student/booking', icon: CalendarCheck },
    { name: 'Schedule', href: '/student/schedule', icon: CalendarDays },
    { name: 'History', href: '/student/history', icon: History },
    { name: 'Profile', href: '/student/profile', icon: UserCircle },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#f3f5f9] border-r border-[#e7e9f0] z-40 flex flex-col">
      <div className="px-6 pt-7 pb-5 border-b border-[#eceef4]">
        <p className="text-[34px] leading-none font-extrabold tracking-[-0.03em] text-[#2f3243]">Edmarg</p>
        <p className="text-[11px] tracking-[0.18em] font-semibold uppercase text-[#71788a]">Career Curator</p>
      </div>

      <div className="flex flex-col h-full px-4 py-6">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#e8ebff] text-[#4f46e5]'
                    : 'text-[#586174] hover:bg-[#e8ebff] hover:text-[#4f46e5]'
                }`}
              >
                <item.icon size={18} strokeWidth={2.2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-[#e5ebf3] px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#edc8a6] flex items-center justify-center text-[#7c5b43] font-bold">A</div>
          <div>
            <p className="text-[15px] font-semibold text-[#3a3f4d] leading-tight">Alex Johnson</p>
            <p className="text-[12px] text-[#768095] leading-tight">Student Pro</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
