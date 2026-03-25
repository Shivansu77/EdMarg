'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

const DashboardLayout = ({ children, userName }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#f7f8fc] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader userName={userName} />
        <main className="flex-1 mt-[76px] p-8 overflow-y-auto bg-[#f7f8fc]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
