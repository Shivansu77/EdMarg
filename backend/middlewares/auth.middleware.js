const jwt = require('jsonwebtoken');
const { User, TokenBlacklist } = require('../models/user.model');

/* ================= TOKEN EXTRACTOR ================= */
const getTokenFromRequest = (req) => {
  // cookie priority
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // bearer token fallback
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
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
    const isBlacklisted = await TokenBlacklist.exists({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again',
      });
    }

    /* ---------- Fetch user ---------- */
    const user = await User.findById(decoded.userId)
      .select('-password')
      .lean();

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
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
    }

    next();
  };
};