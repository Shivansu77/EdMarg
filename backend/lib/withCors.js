/**
 * Serverless-safe CORS wrapper for Vercel Express functions
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://frontend-alpha-nine-92.vercel.app',
  'https://edmarg-frontend.vercel.app',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalOrigin =
    typeof origin === 'string' &&
    (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));

  // In production we enforce an allow-list; in dev we allow local origins.
  if (origin && (!isProduction ? isLocalOrigin || ALLOWED_ORIGINS.includes(origin) : ALLOWED_ORIGINS.includes(origin))) {
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
