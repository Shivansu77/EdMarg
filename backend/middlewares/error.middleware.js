const { AppError } = require('../utils/errors');
const multer = require('multer');

const isMongoPoolTimeoutError = (error) =>
  error?.name === 'MongoWaitQueueTimeoutError' ||
  (typeof error?.message === 'string' &&
    error.message.includes('Timed out while checking out a connection from connection pool'));

const errorHandler = (err, req, res, next) => {
  // Let global CORS middleware handle headers (removed manual setHeader to avoid conflicts)

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is too large',
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid upload payload',
    });
  }

  if (
    typeof err?.message === 'string' &&
    (err.message.includes('Only image files are allowed') ||
      err.message.includes('Only video files are allowed'))
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  if (isMongoPoolTimeoutError(err)) {
    console.error(`ERROR 🔥 [${req.method} ${req.url}]: MongoDB pool timeout`, {
      message: err.message,
      name: err.name,
    });
    res.set('Retry-After', '2');
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily busy. Please retry in a moment.',
      ...(process.env.NODE_ENV === 'development' && {
        hint: 'MongoDB pool checkout timeout. Consider increasing pool size or reducing request burst.',
      }),
    });
  }

  // Log error for server-side debugging
  console.error(`ERROR 🔥 [${req.method} ${req.url}]:`, {
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
  });

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
    // ALWAYS Include hint for the user if it looks like a JWT or DB or Zoom error to help with 500s
    ...(message.includes('secretOrPrivateKey') && { hint: 'CRITICAL: JWT_SECRET environment variable is missing on the server' }),
    ...(message.includes('buffering timed out') && { hint: 'CRITICAL: MONGODB_URI is failing. Check Atlas whitelist and connectivity' }),
    ...(message.includes('Zoom environment variables') && { hint: 'CRITICAL: Zoom Credentials (ID/Secret) are missing on the server' }),
  });
};

module.exports = errorHandler;
