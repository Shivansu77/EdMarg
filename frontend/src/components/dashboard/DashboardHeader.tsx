'use client';

import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

const DashboardHeader = ({ userName = 'Student Dashboard' }: HeaderProps) => {
  return (
    <header className="fixed top-0 right-0 left-64 h-[76px] bg-white border-b border-[#eceef4] z-30 px-8 flex items-center justify-between">
      <h1 className="text-[36px] leading-none font-extrabold tracking-[-0.03em] text-[#2f3445]">{userName}</h1>

      <div className="flex items-center gap-5">
        <div className="relative w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#97a1b6]" size={17} />
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-full bg-[#f4f6fa] pl-11 pr-4 py-2.5 rounded-full text-[14px] placeholder:text-[#97a1b6] text-[#4b5265] outline-none"
          />
        </div>
        <button className="text-[#7f889d] hover:text-[#4f46e5] transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-[#7f889d] hover:text-[#4f46e5] transition-colors">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
