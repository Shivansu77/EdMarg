'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userImage?: string;
}

const DashboardLayout = ({ children, userName, userImage }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-surface-dim flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader userName={userName} userImage={userImage} />
        <main className="flex-1 mt-20 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
