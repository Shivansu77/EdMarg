const DEFAULT_TTL_SECONDS = Math.max(5, Number(process.env.RESPONSE_CACHE_TTL_SECONDS || 30));
const MAX_ENTRIES = Math.max(100, Number(process.env.RESPONSE_CACHE_MAX_ENTRIES || 500));
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const responseCache = new Map();

const setCacheHeaders = (req, res, cacheControl) => {
  res.set('Cache-Control', cacheControl);
  if (req.user?._id) {
    res.set('Vary', 'Authorization, Cookie');
  }
};

const pruneExpiredEntries = (now = Date.now()) => {
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }
};

const enforceMaxEntries = () => {
  while (responseCache.size > MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (!oldestKey) {
      return;
    }
    responseCache.delete(oldestKey);
  }
};

const shouldBypassCache = (req) => {
  if (req.method !== 'GET') {
    return true;
  }

  if (String(req.query?.noCache || '').toLowerCase() === 'true') {
    return true;
  }

  if (req.headers['x-bypass-cache'] === '1') {
    return true;
  }

  const cacheControlHeader = String(req.headers['cache-control'] || '').toLowerCase();
  if (cacheControlHeader.includes('no-cache') || cacheControlHeader.includes('no-store')) {
    return true;
  }

  return false;
};

const buildCacheKey = (req) => {
  const scope = req.user?._id ? `user:${req.user._id}` : 'public';
  return `${scope}:${req.method}:${req.originalUrl}`;
};

const cacheResponse = ({ ttlSeconds = DEFAULT_TTL_SECONDS } = {}) => {
  const normalizedTtlSeconds = Math.max(1, Number(ttlSeconds) || DEFAULT_TTL_SECONDS);

  return (req, res, next) => {
    if (shouldBypassCache(req)) {
      return next();
    }

    const cacheKey = buildCacheKey(req);
    const now = Date.now();
    const cachedEntry = responseCache.get(cacheKey);

    if (cachedEntry && cachedEntry.expiresAt > now) {
      setCacheHeaders(req, res, cachedEntry.cacheControl);
      res.set('X-Response-Cache', 'HIT');
      return res.status(cachedEntry.statusCode).json(cachedEntry.payload);
    }

    if (cachedEntry) {
      responseCache.delete(cacheKey);
    }

    res.set('X-Response-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        pruneExpiredEntries();

        const visibility = req.user?._id ? 'private' : 'public';
        const cacheControl = `${visibility}, max-age=${normalizedTtlSeconds}`;

        responseCache.set(cacheKey, {
          statusCode: res.statusCode,
          payload,
          expiresAt: Date.now() + normalizedTtlSeconds * 1000,
          cacheControl,
        });

        enforceMaxEntries();
        setCacheHeaders(req, res, cacheControl);
      }

      return originalJson(payload);
    };

    next();
  };
};

const clearResponseCache = () => {
  responseCache.clear();
};

const invalidateCacheOnMutation = (req, res, next) => {
  if (!MUTATION_METHODS.has(req.method)) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400 && responseCache.size > 0) {
      clearResponseCache();
    }
  });

  next();
};

module.exports = {
  cacheResponse,
  clearResponseCache,
  invalidateCacheOnMutation,
};
