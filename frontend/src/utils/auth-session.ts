'use client';

/**
 * Browser-side bridge for the Clerk token getter.
 *
 * All API calls must get a current Clerk token instead of trusting a token that
 * happened to be left in localStorage by an earlier session. Keeping this
 * bridge in one place prevents an expired legacy token from looking like a
 * real logout and triggering a redirect loop.
 */
type ClerkTokenGetter = () => Promise<string | null>;

const AUTH_TOKEN_STORAGE_KEY = 'token';
const AUTH_USER_STORAGE_KEY = 'user';
const AUTH_USER_EVENT = 'edmarg-auth-user-change';

let clerkTokenGetter: ClerkTokenGetter | null = null;

const getLegacyToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

const getWindowClerkToken = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const clerk = (window as typeof window & {
    Clerk?: { session?: { getToken?: () => Promise<string | null> } | null };
  }).Clerk;

  try {
    return (await clerk?.session?.getToken?.()) || null;
  } catch {
    return null;
  }
};

export const registerClerkTokenGetter = (getter: ClerkTokenGetter) => {
  clerkTokenGetter = getter;

  return () => {
    if (clerkTokenGetter === getter) {
      clerkTokenGetter = null;
    }
  };
};

/** Return the active Clerk JWT. A legacy value is never used for an API call. */
export const getAuthToken = async () => {
  try {
    const registeredToken = await clerkTokenGetter?.();
    if (registeredToken) {
      persistLegacyToken(registeredToken);
      return registeredToken;
    }
  } catch {
    // The SDK may still be hydrating. The window bridge below covers the small
    // interval before AuthProvider registers its hook-backed getter.
  }

  const windowToken = await getWindowClerkToken();
  if (windowToken) {
    persistLegacyToken(windowToken);
    return windowToken;
  }

  return null;
};

/**
 * Temporary compatibility storage for older UI code. It is never the primary
 * credential source; authenticated requests always ask Clerk first.
 */
export const persistLegacyToken = (token: string) => {
  if (typeof window === 'undefined' || !token) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

/** Clear credentials only when Clerk has actually signed out. */
export const clearLegacyAuthState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  // Remove cookies created by older releases; Clerk manages its own cookies.
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
};

export const hasLegacyAuthToken = () => Boolean(getLegacyToken());
