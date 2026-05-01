'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';
import { resolveApiBaseUrl } from '@/utils/api-base';
import { getDefaultAuthenticatedPath, isProfileComplete } from '@/utils/auth-profile';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'student' | 'mentor' | 'admin';
}

interface StoredAuthUser {
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

const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';
const emptySubscribe = () => () => undefined;

const clearStoredAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
};

const normalizeAuthenticatedUser = (userData: Partial<StoredAuthUser>): StoredAuthUser | null => {
  if (!userData._id || !userData.email || !userData.name || !userData.role) {
    return null;
  }

  return {
    _id: userData._id,
    name: userData.name,
    email: userData.email,
    emailVerification: userData.emailVerification,
    role: userData.role,
    profileImage: userData.profileImage,
    profileImageUpdatedAt: userData.profileImageUpdatedAt,
    phoneNumber: userData.phoneNumber,
    studentProfile: userData.studentProfile,
    mentorProfile: userData.mentorProfile,
  };
};

const syncStoredAuthUser = (nextUser: StoredAuthUser) => {
  if (typeof window === 'undefined') {
    return;
  }

  const nextSerializedUser = JSON.stringify(nextUser);

  if (window.localStorage.getItem(AUTH_USER_STORAGE_KEY) === nextSerializedUser) {
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, nextSerializedUser);
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
};

const readStoredAuthUser = (): StoredAuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawStoredUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!rawStoredUser) {
    return null;
  }

  try {
    return JSON.parse(rawStoredUser) as StoredAuthUser;
  } catch {
    return null;
  }
};

export default function ProtectedRoute({
  children,
  requiredRole = 'student',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const hasHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const isAuthorized = Boolean(user && user.role === requiredRole);
  const currentMentorApprovalStatus =
    user?.mentorProfile?.approvalStatus ?? readStoredAuthUser()?.mentorProfile?.approvalStatus ?? null;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user || user.role !== requiredRole) {
      router.replace('/login');
    }
  }, [hasHydrated, requiredRole, router, user]);

  useEffect(() => {
    if (!hasHydrated || !isAuthorized) {
      return;
    }

    const controller = new AbortController();

    const verifySession = async () => {
      setIsSessionChecking(true);
      try {
        const response = await fetch(
          `${resolveApiBaseUrl()}/api/v1/users/me`,
          createAuthenticatedRequestInit({
            method: 'GET',
            cache: 'no-store',
            headers: {
              'x-bypass-cache': '1',
              'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
          })
        );

        const result = response.ok ? await response.json().catch(() => null) : null;
        const serverRole = result?.data?.role;
        const mentorApprovalStatus = result?.data?.mentorProfile?.approvalStatus || 'pending';
        const destinationPath = getDefaultAuthenticatedPath(result?.data);
        const refreshedUser = normalizeAuthenticatedUser(result?.data || {});
        const previousMentorApprovalStatus = currentMentorApprovalStatus;

        if (!response.ok || serverRole !== requiredRole) {
          clearStoredAuth();
          router.replace('/login');
          return;
        }

        if (refreshedUser) {
          syncStoredAuthUser(refreshedUser);
        }

        if (!isProfileComplete(result?.data) && pathname !== '/complete-profile') {
          router.replace(destinationPath);
          return;
        }

        if (
          requiredRole === 'mentor' &&
          mentorApprovalStatus !== 'approved' &&
          pathname !== '/mentor/profile'
        ) {
          router.replace('/mentor/profile');
          return;
        }

        if (
          requiredRole === 'mentor' &&
          mentorApprovalStatus === 'approved' &&
          pathname === '/mentor/profile' &&
          previousMentorApprovalStatus !== 'approved'
        ) {
          router.replace('/mentor/dashboard');
          return;
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSessionChecking(false);
        }
      }
    };

    void verifySession();

    return () => {
      controller.abort();
    };
  }, [hasHydrated, isAuthorized, pathname, requiredRole, router, currentMentorApprovalStatus]);

  if (!hasHydrated || !isAuthorized || isSessionChecking) {
    const loadingMessage = !hasHydrated
      ? 'Preparing your session...'
      : isSessionChecking
        ? 'Verifying your session...'
        : 'Redirecting to login...';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-500" />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">{loadingMessage}</p>
            <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
