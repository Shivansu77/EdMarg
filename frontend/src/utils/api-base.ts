
// Force the API base to the reliable Render server to bypass Vercel Authentication SSO blockers
const configuredApiBase = 'https://edmarg-backend.vercel.app';


/**
 * Production: use same-origin base so browser requests go through Next.js API proxy
 * (/api/v1/* -> backend), avoiding cross-origin CORS preflight issues.
 *
 * Local dev: honor configured backend URL (usually localhost:5000).
 */
export const resolveApiBaseUrl = () => {
  const isDev = process.env.NODE_ENV === 'development';

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.') || hostname.includes('10.0.');
    
    // In dev, prefer local backend
    if (isDev || isLocal) {
      return 'http://localhost:5000';
    }
    return configuredApiBase || 'https://edmarg-backend.vercel.app';
  }

  // SSR fallback
  return isDev ? 'http://localhost:5000' : (configuredApiBase || 'https://edmarg-backend.vercel.app');
};
