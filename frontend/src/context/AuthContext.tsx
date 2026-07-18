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

const readApiResponse = async (response: Response): Promise<AuthApiResponse> => {
  const rawBody = await response.text();
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody) as AuthApiResponse;
  } catch {
    return { message: rawBody };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkUser();
  const { getToken } = useClerkAuth();
  const clerk = useClerk();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBackendProfile = async () => {
      if (!isClerkLoaded) return;

      if (!isClerkSignedIn) {
        if (isMounted) {
          setUser(null);
          setIsLoadingProfile(false);
        }
        return;
      }

      setIsLoadingProfile(true);

      try {
        const token = await getToken();
        if (!token) throw new Error('Clerk session token is unavailable');

        const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'x-bypass-cache': '1',
            'Cache-Control': 'no-cache',
          },
        });

        const result = await readApiResponse(response);
        
        if (!response.ok || !result.data?._id) {
          throw new Error(result.error || result.message || 'Unable to sync profile');
        }

        if (isMounted) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void fetchBackendProfile();

    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, isClerkSignedIn, getToken]);

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const login = async () => {
    throw new Error('Use Clerk sign-in to authenticate');
  };

  const logout = async () => {
    setUser(null);
    await clerk.signOut();
  };

  const isAuthLoading = !isClerkLoaded || isLoadingProfile;

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
