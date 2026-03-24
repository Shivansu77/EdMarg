const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const getTokenFromRequest = (req) => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

exports.protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Token missing',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret_in_env');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. User not found',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Invalid or expired token',
    });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied for this role',
    });
  }
  return next();
};
