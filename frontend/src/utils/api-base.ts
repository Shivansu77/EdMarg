const DEFAULT_REMOTE_API_BASE = 'https://edmarg-backend.vercel.app';
const DEFAULT_LOCAL_API_BASE = 'http://localhost:5000';

const normalizeApiBase = (value: string) =>
  value.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const isLocalHostname = (hostname: string) =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.endsWith('.local') ||
  hostname.startsWith('192.168.') ||
  hostname.startsWith('10.');

const getConfiguredBackendBase = (fallback: string) =>
  normalizeApiBase(
    process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      fallback
  );

export const resolveBackendBaseUrl = (requestUrl?: string) => {
  const hostname =
    typeof window !== 'undefined'
      ? window.location.hostname
      : requestUrl
        ? new URL(requestUrl).hostname
        : undefined;

  if (hostname && isLocalHostname(hostname)) {
    return getConfiguredBackendBase(DEFAULT_LOCAL_API_BASE);
  }

  return getConfiguredBackendBase(DEFAULT_REMOTE_API_BASE);
};


/**
 * Browser requests always use the same-origin Next.js API proxy (`/api/v1/*`),
 * which forwards to the real backend and avoids CORS issues in local dev.
 * Server-side code can still talk to the backend directly.
 */
export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return resolveBackendBaseUrl();
};
