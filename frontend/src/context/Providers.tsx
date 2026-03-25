'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
};
