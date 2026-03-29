const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Ensure CORS headers are present even on errors
  if (!res.headersSent) {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Log error for server-side debugging
  console.error('ERROR 💥:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value',
    });
  }

  // General 500 error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    // Include hint for the user if it looks like a JWT or DB error
    ...(message.includes('secretOrPrivateKey') && { hint: 'Check JWT_SECRET environment variable' }),
    ...(message.includes('buffering timed out') && { hint: 'Check MONGODB_URI connectivity' }),
  });
};

module.exports = errorHandler;
