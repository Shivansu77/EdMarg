const normalizeBaseUrl = (value: string) => value.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

// Force the API base to the reliable Render server to bypass Vercel Authentication SSO blockers
const configuredApiBase = 'https://edmarg.onrender.com';

const isLocalHost = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1';

/**
 * Production: use same-origin base so browser requests go through Next.js API proxy
 * (/api/v1/* -> backend), avoiding cross-origin CORS preflight issues.
 *
 * Local dev: honor configured backend URL (usually localhost:5000).
 */
export const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return configuredApiBase || 'https://edmarg.onrender.com';
  }

  // SSR fallback
  return configuredApiBase || 'https://edmarg.onrender.com';
};
