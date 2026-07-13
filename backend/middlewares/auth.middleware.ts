// @ts-nocheck
const { User } = require('../models/user.model');
const userService = require('../services/user.service');

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

    const decoded = await userService.verifyClerkToken(token);
    const clerkId = decoded?.sub;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Clerk session',
      });
    }

    let user = await withPoolCheckoutRetry(
      () =>
        User.findOne({ clerkId })
          .select('-password')
          .lean(),
      'User.findOneByClerkId'
    );

    if (!user) {
      const syncedUser = await withPoolCheckoutRetry(
        () => userService.syncClerkUserFromToken(token),
        'userService.syncClerkUserFromToken'
      );
      user = userService.sanitizeUser(syncedUser);
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError' ||
      error.statusCode === 401
    ) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid token',
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
