/**
 * Serverless-safe CORS wrapper for Vercel Express functions
 */

const splitOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = [
  'https://edmarg.com',
  'https://www.edmarg.com',
  'https://edmarg.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  ...splitOrigins(process.env.FRONTEND_ORIGIN),
  ...splitOrigins(process.env.FRONTEND_ORIGINS),
  ...splitOrigins(process.env.NEXT_PUBLIC_APP_URL),
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalOrigin =
    typeof origin === 'string' &&
    (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
  const isVercelApp = typeof origin === 'string' && origin.endsWith('.vercel.app');
  const isListedOrigin = typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin);

  // In production we enforce an allow-list; in dev we allow local origins.
  if (origin && (isVercelApp || isListedOrigin || (!isProduction && isLocalOrigin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  const requestedHeaders = req.headers['access-control-request-headers'];
  res.setHeader(
    'Access-Control-Allow-Headers',
    requestedHeaders || 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
}

function withCors(handler) {
  return (req, res, next) => {
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return handler(req, res, next);
  };
}

module.exports = { withCors, setCorsHeaders };
