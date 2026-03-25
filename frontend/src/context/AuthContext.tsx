'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);

    localStorage.setItem('user', JSON.stringify(result.data));
    setUser(result.data);
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
