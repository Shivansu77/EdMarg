const normalizeBaseUrl = (value: string) => value.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const configuredApiBase = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
);

const isLocalHost = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1';

/**
 * Production: use same-origin base so browser requests go through Next.js API proxy
 * (/api/v1/* -> backend), avoiding cross-origin CORS preflight issues.
 *
 * Local dev: honor configured backend URL (usually localhost:5000).
 */
export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (isLocalHost(window.location.hostname)) {
      return configuredApiBase || normalizeBaseUrl(window.location.origin);
    }

    return normalizeBaseUrl(window.location.origin);
  }

  // SSR fallback
  return configuredApiBase || 'https://edmarg-backend.vercel.app';
};
