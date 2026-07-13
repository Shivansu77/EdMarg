'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import {
  useAuth as useClerkAuth,
  useClerk,
  useUser as useClerkUser,
} from '@clerk/nextjs';
import { resolveApiBaseUrl } from '@/utils/api-base';

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerification?: {
    isVerified?: boolean;
    verifiedAt?: string;
  };
  role: 'student' | 'mentor' | 'admin';
  profileImage?: string;
  profileImageUpdatedAt?: number;
  phoneNumber?: string;
  studentProfile?: {
    classLevel?: string;
    interests?: string[];
  };
  mentorProfile?: {
    linkedinUrl?: string;
    expertise?: string[];
    approvalStatus?: 'pending' | 'approved' | 'rejected';
  };
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
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';
let cachedUserStorageValue: string | null = null;
let cachedUserSnapshot: User | null = null;

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
  
  // Clear cookie for middleware
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
};

const persistAuthStorage = (user: User, token?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    // Set cookie for middleware (1 day expiry)
    document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  }
};

const normalizeUser = (data?: Partial<User> | null): User | null => {
  if (!data?._id || !data.email || !data.name || !data.role) {
    return null;
  }

  return {
    _id: data._id,
    name: data.name,
    email: data.email,
    emailVerification: data.emailVerification,
    role: data.role,
    profileImage: data.profileImage,
    profileImageUpdatedAt: data.profileImageUpdatedAt,
    phoneNumber: data.phoneNumber,
    studentProfile: data.studentProfile,
    mentorProfile: data.mentorProfile,
  };
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

  const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedToken) {
    if (storedUser) {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      cachedUserStorageValue = null;
      cachedUserSnapshot = null;
    }

    return null;
  }

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
  const storedUser = useSyncExternalStore(subscribeToAuthUser, getStoredUserSnapshot, () => null);
  const {
    isLoaded: isClerkLoaded,
    isSignedIn: isClerkSignedIn,
  } = useClerkUser();
  const { getToken } = useClerkAuth();
  const clerk = useClerk();
  const user = storedUser;
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return Boolean(getStoredToken());
  });

  useEffect(() => {
    let isMounted = true;

    const validateStoredSession = async () => {
      const token = getStoredToken();

      if (!token) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-bypass-cache': '1',
            'Cache-Control': 'no-cache',
          },
        });

        const result = await readApiResponse(response);

        if (
          !response.ok ||
          !result.data?._id ||
          !result.data.email ||
          !result.data.name ||
          !result.data.role
        ) {
          clearAuthStorage();
          emitAuthChange();
          return;
        }

        const authenticatedUser: User = {
          _id: result.data._id,
          name: result.data.name,
          email: result.data.email,
          emailVerification: result.data.emailVerification,
          role: result.data.role,
          profileImage: result.data.profileImage,
          profileImageUpdatedAt: result.data.profileImageUpdatedAt,
          phoneNumber: result.data.phoneNumber,
          studentProfile: result.data.studentProfile,
          mentorProfile: result.data.mentorProfile,
        };

        persistAuthStorage(authenticatedUser, token);
        emitAuthChange();
      } catch {
        clearAuthStorage();
        emitAuthChange();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void validateStoredSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncClerkSession = async () => {
      if (!isClerkLoaded) {
        return;
      }

      if (!isClerkSignedIn) {
        clearAuthStorage();
        emitAuthChange();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Clerk session token is unavailable');
        }

        const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-bypass-cache': '1',
            'Cache-Control': 'no-cache',
          },
        });

        const result = await readApiResponse(response);
        const authenticatedUser = normalizeUser(result.data);

        if (!response.ok || !authenticatedUser) {
          throw new Error(result.error || result.message || 'Unable to sync profile');
        }

        persistAuthStorage(authenticatedUser, token);
        emitAuthChange();
      } catch {
        clearAuthStorage();
        emitAuthChange();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void syncClerkSession();

    return () => {
      isMounted = false;
    };
  }, [getToken, isClerkLoaded, isClerkSignedIn]);

  const updateUser = (patch: Partial<User>) => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentUser = getStoredUserSnapshot();
    if (!currentUser) {
      return;
    }

    const nextUser: User = {
      ...currentUser,
      ...patch,
    };

    persistAuthStorage(nextUser, getStoredToken() || undefined);
    emitAuthChange();
  };

  const login = async () => {
    throw new Error('Use Clerk sign-in to authenticate');
  };

  const logout = async () => {
    try {
      await clerk.signOut();
    } finally {
      clearAuthStorage();
      emitAuthChange();
    }
  };

  const isAuthLoading =
    isLoading || !isClerkLoaded || Boolean(isClerkSignedIn && !storedUser);

  return (
    <AuthContext.Provider value={{ user, isLoading: isAuthLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
