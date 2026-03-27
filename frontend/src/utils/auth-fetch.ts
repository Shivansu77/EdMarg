'use client';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('token');
};

export const createAuthenticatedRequestInit = (init: RequestInit = {}): RequestInit => {
  const headers = new Headers(init.headers);
  const token = getStoredToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return {
    ...init,
    credentials: 'include',
    headers,
  };
};
