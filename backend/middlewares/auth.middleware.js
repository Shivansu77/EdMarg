const jwt = require('jsonwebtoken');
const { User, TokenBlacklist } = require('../models/user.model');

/* ================= TOKEN EXTRACTOR ================= */
const getTokenFromRequest = (req) => {
  // Explicit Authorization headers should win over cookies so the active
  // frontend session token is not shadowed by a stale cross-site cookie.
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

const isMongoPoolTimeoutError = (error) =>
  error?.name === 'MongoWaitQueueTimeoutError' ||
  (typeof error?.message === 'string' &&
    error.message.includes('Timed out while checking out a connection from connection pool'));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withPoolCheckoutRetry = async (operation, label) => {
  try {
    return await operation();
  } catch (error) {
    if (!isMongoPoolTimeoutError(error)) {
      throw error;
    }

    const retryDelayMs = Number(process.env.MONGODB_POOL_RETRY_DELAY_MS) || 120;
    console.warn(`[AUTH_DB_RETRY] ${label} failed with pool timeout. Retrying in ${retryDelayMs}ms...`);
    await delay(retryDelayMs);
    return operation();
  }
};

/* ================= PROTECT MIDDLEWARE ================= */
exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    /* ---------- Verify JWT ---------- */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ---------- Check blacklist ---------- */
    const isBlacklisted = await withPoolCheckoutRetry(
      () => TokenBlacklist.exists({ token }),
      'TokenBlacklist.exists'
    );

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again',
      });
    }

    /* ---------- Fetch user ---------- */
    const user = await withPoolCheckoutRetry(
      () =>
        User.findById(decoded.userId)
          .select('-password')
          .lean(),
      'User.findById'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return next(error);
  }
};

/* ================= ROLE AUTHORIZATION ================= */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = String(req.user.role).toLowerCase();

    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.warn(`[AUTH] 403 Forbidden for User ${req.user._id}: role '${userRole}' not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};

/* ================= MENTOR APPROVAL GATE ================= */
exports.requireApprovedMentor = (req, res, next) => {
  if (!req.user || req.user.role !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: mentor account required',
    });
  }

  const approvalStatus = req.user.mentorProfile?.approvalStatus || 'pending';
  if (approvalStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your mentor account is pending admin approval. You can only access your profile right now.',
      data: {
        approvalStatus,
      },
    });
  }

  next();
};
