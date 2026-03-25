'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
