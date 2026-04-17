'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderRadius: '0.75rem',
          },
        }}
      />
    </AuthProvider>
  );
};
