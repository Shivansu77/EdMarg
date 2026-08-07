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
  ensureBackendAwake,
  invalidateBackendReadiness,
  isBackendUnavailableStatus,
} from '@/utils/backend-ready';
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

/** Attempts for a profile fetch that fails in a way the backend recovers from. */
const MAX_PROFILE_ATTEMPTS = 3;
/** A profile sync should never hang the app behind an unbounded request. */
const PROFILE_TIMEOUT_MS = 20_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readApiResponse = async (response: Response): Promise<AuthApiResponse> => {
  const rawBody = await response.text();
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody) as AuthApiResponse;
  } catch {
    return { message: rawBody };
  }
};

interface ProfileFetchOutcome {
  ok: boolean;
  status: number;
  result: AuthApiResponse;
}

/**
 * A `fetch()` rejection is always an opaque `TypeError: Failed to fetch` — the
 * browser deliberately hides whether the cause was a dead server, DNS, a
 * missing CORS header, or an offline device. Reporting status `0` lets the
 * caller treat it like any other transient backend-unavailable result.
 */
const fetchProfileOnce = async (token: string): Promise<ProfileFetchOutcome> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);

  try {
    const response = await fetch(`${resolveApiBaseUrl()}/api/v1/users/me`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-bypass-cache': '1',
        'Cache-Control': 'no-cache',
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      result: await readApiResponse(response),
    };
  } catch {
    return { ok: false, status: 0, result: {} };
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Fetch the profile, retrying only failures that a retry can actually fix
 * (cold start, proxy 502/503, dropped connection). A 401/403/404 is returned
 * immediately, since replaying it would produce the same answer.
 */
const fetchProfileWithRetry = async (token: string): Promise<ProfileFetchOutcome> => {
  let outcome = await fetchProfileOnce(token);

  for (let attempt = 1; attempt < MAX_PROFILE_ATTEMPTS; attempt += 1) {
    if (outcome.ok || !isBackendUnavailableStatus(outcome.status)) {
      return outcome;
    }

    invalidateBackendReadiness();
    await sleep(1000 * attempt);
    await ensureBackendAwake(30_000);
    outcome = await fetchProfileOnce(token);
  }

  return outcome;
};

/** Turn a failed profile sync into something a user can act on. */
const describeProfileFailure = ({ status, result }: ProfileFetchOutcome) => {
  if (result.error || result.message) {
    return result.error || result.message!;
  }

  if (status === 0) {
    return `Cannot reach the server at ${resolveApiBaseUrl()}. Please check that the backend is running and try again.`;
  }

  if (isBackendUnavailableStatus(status)) {
    return 'The server is temporarily unavailable. Please try again in a moment.';
  }

  return 'Unable to sync profile';
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
        const outcome = await dedupeInFlight('GET:/api/v1/users/me', () =>
          fetchProfileWithRetry(token)
        );

        if (!outcome.ok || !outcome.result.data?._id) {
          throw new Error(describeProfileFailure(outcome));
        }

        if (isMounted) {
          setUser(outcome.result.data);
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
