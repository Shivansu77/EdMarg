// @ts-nocheck
const { User } = require('../models/user.model');
const userService = require('../services/user.service');
const { getAuth } = require('@clerk/express');

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
// `requireAuth()` is intentionally not used for API routes. Clerk's deprecated
// helper redirects unauthenticated requests to a sign-in page, which turns an
// API 401 into an HTML/navigation response when a proxy follows redirects.
// APIs must return JSON so clients can distinguish an expired session from a
// temporary backend problem and never enter a login/dashboard redirect loop.
const fetchUserFromDb = async (req, res, next) => {
  try {
    const authState = getAuth(req);
    const clerkId = authState?.userId;

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
      // If user isn't in DB yet, attempt to sync them from Clerk via an upsert
      const syncedUser = await withPoolCheckoutRetry(
        () => userService.syncClerkUserByClerkId(clerkId),
        'userService.syncClerkUserByClerkId'
      );
      user = userService.sanitizeUser(syncedUser);
    }

    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

exports.protect = [fetchUserFromDb];

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
