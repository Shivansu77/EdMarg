'use client';

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
    userName?: string;
    userImage?: string;
}

const DashboardHeader = ({ userName = 'Student', userImage }: HeaderProps) => {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-surface-container-lowest/80 backdrop-blur-[12px] z-30 px-10 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for mentors, courses, assessments..." 
            className="w-full pl-12 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-full focus:bg-surface-container-lowest focus:border-primary focus:shadow-[0_0_0_2px_var(--color-primary-fixed-dim)] outline-none transition-all text-[14px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-dim rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-[14px] font-semibold text-on-surface">{userName}</p>
            <p className="text-[12px] text-on-surface-variant capitalize">Student</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
            {userImage ? (
                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
                <User size={20} className="text-on-surface-variant" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
