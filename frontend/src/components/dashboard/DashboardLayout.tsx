'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'edmarg-dashboard-sidebar-collapsed';
const SIDEBAR_COLLAPSED_EVENT = 'edmarg-dashboard-sidebar-collapsed-change';

const subscribeToSidebarCollapsed = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_COLLAPSED_STORAGE_KEY) {
      callback();
    }
  };

  const handleSidebarCollapsedChange = () => {
    callback();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, handleSidebarCollapsedChange);
  };
};

const getSidebarCollapsedSnapshot = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedSidebarCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
  return storedSidebarCollapsed === 'true';
};

const DashboardLayout = ({ children, userName }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isSidebarCollapsed = useSyncExternalStore(
    subscribeToSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    () => false
  );

  const toggleSidebarCollapsed = () => {
    const nextSidebarCollapsed = !isSidebarCollapsed;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, nextSidebarCollapsed ? 'true' : 'false');
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 overflow-hidden">
      {/* Glassmorphism Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-200/40 mix-blend-multiply blur-[120px] opacity-70 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-200/40 mix-blend-multiply blur-[120px] opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 mix-blend-multiply blur-[120px] opacity-70 pointer-events-none"></div>

      <div className="relative flex min-h-screen z-10">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          side="left"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            userName={userName}
            onMenuClick={() => setIsSidebarOpen((currentValue) => !currentValue)}
          />
          <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
