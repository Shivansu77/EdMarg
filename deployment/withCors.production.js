/**
 * Production CORS configuration for Hostinger deployment
 */

const ALLOWED_ORIGINS = [
  'https://edmarg.com',
  'http://localhost:3000',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
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
