const DEFAULT_API_BASE = 'https://edmarg-backend.vercel.app';

const normalizeApiBase = (value: string) =>
  value.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const configuredApiBase = normalizeApiBase(
  process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE
);


/**
 * Production: use same-origin base so browser requests go through Next.js API proxy
 * (/api/v1/* -> backend), avoiding cross-origin CORS preflight issues.
 *
 * Local dev: honor configured backend URL (usually localhost:5000).
 */
export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('192.168.') ||
      hostname.includes('10.0.');
    const forceLocalBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true';

    if (isLocalHost && forceLocalBackend) {
      return 'http://localhost:5000';
    }

    return configuredApiBase;
  }

  return configuredApiBase;
};
