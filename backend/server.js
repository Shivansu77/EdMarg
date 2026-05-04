const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { ALLOWED_ORIGINS, setCorsHeaders } = require('./lib/withCors');
const connectDB = require('./lib/db');
const { invalidateCacheOnMutation } = require('./middlewares/cache.middleware');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io on the HTTP server
const { initSocket } = require('./lib/socket');
initSocket(server);

// Preserve proxy-aware behavior for secure cookies, rate limiting, and deployment headers.
app.set('trust proxy', 1);
app.disable('x-powered-by');

console.log('\n=========================================');
console.log('EDMARG BACKEND STARTING...');
console.log('Time:', new Date().toISOString());
console.log('=========================================\n');

console.log('✅ CORS Frontend Origin Env:', ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : 'none');
console.log('🚀 CORS middleware active (supports allow-list + *.vercel.app previews)');

// 1. Manual CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS] ${req.method} ${req.url} | origin: ${origin || 'none'}`);

  setCorsHeaders(req, res);

  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    console.warn(`[CORS] ❌ Rejected origin: ${origin}`);
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// 2. Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Critical environment checks
console.log('🔍 Environment check: JWT_SECRET =', process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'MISSING');
console.log('🔍 Environment check: MONGODB_URI =', process.env.MONGODB_URI ? 'SET (starts with: ' + process.env.MONGODB_URI.substring(0, 15) + '...)' : 'MISSING');
console.log('🔍 Environment check: ZOOM_ENABLED =', (process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) ? 'YES' : 'NO (Missing Zoom Credentials)');
console.log('🔍 Environment check: NODE_ENV =', process.env.NODE_ENV || 'development');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
}

const HEALTH_ROUTE_PATHS = new Set(['/health', '/api/v1/health', '/api/status', '/status']);
const NO_DATABASE_ROUTE_PATHS = new Set([
  '/api/v1/users/auth/google',
  '/api/users/auth/google',
]);
let dbConnectPromise = null;

const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] || 'unknown';
};

const buildHealthPayload = () => ({
  status: 'success',
  message: 'Healthy',
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.round(process.uptime()),
  database: getDatabaseStatus(),
});

const healthCheckHandler = (_req, res) => {
  res.status(200).json(buildHealthPayload());
};

app.get('/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);
app.get('/api/status', (req, res) => {
  res.status(200).json(buildHealthPayload());
});
app.get('/status', (req, res) => {
  res.status(200).json(buildHealthPayload());
});

const ensureDatabaseConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectPromise) {
    dbConnectPromise = connectDB().finally(() => {
      dbConnectPromise = null;
    });
  }

  await dbConnectPromise;
};

// 1.5 Database Connection Middleware - avoid gating health checks
app.use(async (req, res, next) => {
  if (HEALTH_ROUTE_PATHS.has(req.path) || NO_DATABASE_ROUTE_PATHS.has(req.path)) {
    return next();
  }

  try {
    await ensureDatabaseConnection();
    next();
  } catch (err) {
    console.error('DB_CONNECTION_FAILURE:', err.message);
    res.set('Retry-After', '5');
    res.status(503).json({
      success: false,
      message: 'Server is waking up and connecting to the database. Please retry in a few seconds.',
      hint: 'Render cold start or MongoDB connectivity delay',
    });
  }
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(invalidateCacheOnMutation);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many attempts, please try again later',
  skip: (req) => !(req.method === 'POST' && req.path === '/login'),
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: typeof options.message === 'string' ? options.message : 'Too many attempts, please try again later',
    });
  },
});

// Routes
const userRouteV1 = require('./routes/v1/user.route');
const adminRouteV1 = require('./routes/v1/admin.route');
const bookingRouteV1 = require('./routes/v1/booking.route');
const availabilityRouteV1 = require('./routes/v1/availability.route');
const mentorRouteV1 = require('./routes/v1/mentor.route');
const zoomRouteV1 = require('./routes/v1/zoom.route');
const reviewRouteV1 = require('./routes/v1/review.route');
const profileRouteV1 = require('./routes/v1/profile.route');
const recordingRouteV1 = require('./routes/v1/recording.route');
const messageRouteV1 = require('./routes/v1/message.route');
const goalRouteV1 = require('./routes/v1/goal.route');
const userRouteV2 = require('./routes/v2/user.route');
const adminRouteV2 = require('./routes/v2/admin.route');
const assessmentRoute = require('./routes/assessment.route');
const blogRoute = require('./routes/blog.route');
const errorHandler = require('./middlewares/error.middleware');

app.use('/api/v1/users', authLimiter, userRouteV1);
app.use('/api/v1/admin', adminRouteV1);
app.use('/api/v1/bookings', bookingRouteV1);
app.use('/api/v1/availability', availabilityRouteV1);
app.use('/api/v1/mentor', mentorRouteV1);
app.use('/api/v1/zoom', zoomRouteV1);
app.use('/api/v1/reviews', reviewRouteV1);
app.use('/api/v1/profile', profileRouteV1);
app.use('/api/v1/recordings', recordingRouteV1);
app.use('/api/v1/messages', messageRouteV1);
app.use('/api/v1/goals', goalRouteV1);
app.use('/api/v1/assessments', assessmentRoute);
app.use('/api/blogs', blogRoute);
app.use('/api/v2/users', authLimiter, userRouteV2);
app.use('/api/v2/admin', adminRouteV2);

// Backward compatibility - default to v1
app.use('/api/users', authLimiter, userRouteV1);
app.use('/api/admin', adminRouteV1);

// Error handling
app.use(errorHandler);

// Database connection - NO LONGER NEEDED HERE as it is handled by connectDB middleware
// connectionOptions moved to lib/db.js

// Export app immediately for Vercel
module.exports = app;

// Only listen if running locally or on Render
if (require.main === module || process.env.RENDER) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
