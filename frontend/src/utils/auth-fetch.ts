'use client';

import { getAuthToken } from '@/utils/auth-session';

/**
 * Build an authenticated request from the current Clerk session.
 *
 * This is asynchronous by design: a Clerk session can refresh its JWT between
 * two requests, whereas a localStorage token cannot safely represent that
 * state.
 */
export const createAuthenticatedRequestInit = async (
  init: RequestInit = {}
): Promise<RequestInit> => {
  const headers = new Headers(init.headers);
  const token = await getAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return {
    ...init,
    credentials: 'include',
    headers,
  };
};
