'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  profileImage?: string;
}

interface AuthApiResponse {
  error?: string;
  message?: string;
  data?: User & {
    token?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';
let cachedUserStorageValue: string | null = null;
let cachedUserSnapshot: User | null = null;

const resolveApiBaseUrl = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000';

  return baseUrl.replace(/\/$/, '');
};

const emitAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_USER_EVENT));
  }
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

const persistAuthStorage = (user: User, token?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
};

const readApiResponse = async (response: Response): Promise<AuthApiResponse> => {
  const rawBody = await response.text();

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as AuthApiResponse;
  } catch {
    return {
      message: rawBody,
    };
  }
};

const subscribeToAuthUser = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_USER_STORAGE_KEY || event.key === AUTH_TOKEN_STORAGE_KEY) {
      callback();
    }
  };

  const handleAuthUserChange = () => {
    callback();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(AUTH_USER_EVENT, handleAuthUserChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(AUTH_USER_EVENT, handleAuthUserChange);
  };
};

const getStoredUserSnapshot = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (storedUser === cachedUserStorageValue) {
    return cachedUserSnapshot;
  }

  cachedUserStorageValue = storedUser;

  if (!storedUser) {
    cachedUserSnapshot = null;
    return null;
  }

  try {
    cachedUserSnapshot = JSON.parse(storedUser) as User;
    return cachedUserSnapshot;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    cachedUserStorageValue = null;
    cachedUserSnapshot = null;
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribeToAuthUser, getStoredUserSnapshot, () => null);
  const isLoading = false;

  const login = async (email: string, password: string) => {
    const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const result = await readApiResponse(response);
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Unable to login');
    }

    if (!result.data?._id || !result.data.email || !result.data.name || !result.data.role) {
      clearAuthStorage();
      emitAuthChange();
      throw new Error('Login response was incomplete');
    }

    const authenticatedUser: User = {
      _id: result.data._id,
      name: result.data.name,
      email: result.data.email,
      role: result.data.role,
      profileImage: result.data.profileImage,
    };

    persistAuthStorage(authenticatedUser, result.data.token);
    emitAuthChange();
    return authenticatedUser;
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        const result = await readApiResponse(response);
        throw new Error(result.error || result.message || 'Unable to logout');
      }
    } finally {
      clearAuthStorage();
      emitAuthChange();
    }
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
