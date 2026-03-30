const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // Let global CORS middleware handle headers (removed manual setHeader to avoid conflicts)

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
    // ALWAYS Include hint for the user if it looks like a JWT or DB error to help with 500s
    ...(message.includes('secretOrPrivateKey') && { hint: 'CRITICAL: JWT_SECRET environment variable is missing on the server' }),
    ...(message.includes('buffering timed out') && { hint: 'CRITICAL: MONGODB_URI is failing. Check Atlas whitelist and connectivity' }),
  });
};

module.exports = errorHandler;
