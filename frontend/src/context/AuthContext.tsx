'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  useAuth as useClerkAuth,
  useClerk,
  useUser as useClerkUser,
} from '@clerk/nextjs';
import { resolveApiBaseUrl } from '@/utils/api-base';
import { dedupeInFlight } from '@/utils/request-dedupe';
import {
  clearLegacyAuthState,
  persistLegacyToken,
  registerClerkTokenGetter,
} from '@/utils/auth-session';

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
  isSignedIn: boolean;
  profileError: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  refreshUser: () => void;
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileRefreshVersion, setProfileRefreshVersion] = useState(0);

  useEffect(() => registerClerkTokenGetter(getToken), [getToken]);

  const refreshUser = useCallback(() => {
    setProfileRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBackendProfile = async () => {
      if (!isClerkLoaded) return;

      if (!isClerkSignedIn) {
        if (isMounted) {
          setUser(null);
          setIsLoadingProfile(false);
          setProfileError(null);
        }
        clearLegacyAuthState();
        return;
      }

      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error('Clerk session token is unavailable');
        persistLegacyToken(token);

        // Coalesce overlapping profile fetches. React StrictMode (dev) mounts
        // this provider twice and re-renders can retrigger this effect; sharing
        // a single in-flight request avoids duplicate `/users/me` calls.
        const { ok, result } = await dedupeInFlight(
          'GET:/api/v1/users/me',
          async () => {
            const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/me`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'x-bypass-cache': '1',
                'Cache-Control': 'no-cache',
              },
            });
            return { ok: response.ok, result: await readApiResponse(response) };
          }
        );

        if (!ok || !result.data?._id) {
          throw new Error(result.error || result.message || 'Unable to sync profile');
        }

        if (isMounted) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        if (isMounted) {
          setUser(null);
          setProfileError(
            err instanceof Error ? err.message : 'Unable to load your account right now.'
          );
        }
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
  }, [isClerkLoaded, isClerkSignedIn, getToken, profileRefreshVersion]);

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const login = async () => {
    throw new Error('Use Clerk sign-in to authenticate');
  };

  const logout = async () => {
    // Do not clear React state before Clerk confirms the sign-out. Otherwise a
    // failed sign-out leaves Clerk authenticated but makes the UI navigate to
    // /login, which is exactly the state that can bounce back to /dashboard.
    await clerk.signOut();
    setUser(null);
    setProfileError(null);
    clearLegacyAuthState();
  };

  const isAuthLoading = !isClerkLoaded || isLoadingProfile;
  const isSignedIn = isClerkLoaded && Boolean(isClerkSignedIn);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isAuthLoading,
        isSignedIn,
        profileError,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
