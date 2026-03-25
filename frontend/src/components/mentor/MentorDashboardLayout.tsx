'use client';

import React, { useState, useSyncExternalStore } from 'react';
import MentorSidebar from './MentorSidebar';
import MentorHeader from './MentorHeader';

interface MentorDashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'edmarg-mentor-sidebar-collapsed';
const SIDEBAR_COLLAPSED_EVENT = 'edmarg-mentor-sidebar-collapsed-change';

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

const MentorDashboardLayout = ({ children }: MentorDashboardLayoutProps) => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <MentorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <MentorHeader onMenuClick={() => setIsSidebarOpen((currentValue) => !currentValue)} />
          <main className="flex-1 px-6 py-8 lg:px-10">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardLayout;
