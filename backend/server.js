const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { ALLOWED_ORIGINS } = require('./lib/withCors');
const connectDB = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 5000;

// 0. Base Configuration - Root level fixes for Vercel
app.set('trust proxy', 1);
app.disable('x-powered-by');

const configuredFrontendOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGINS,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

console.log('✅ CORS Frontend Origin Env:', configuredFrontendOrigins.length ? configuredFrontendOrigins : 'none');
console.log('🚀 CORS middleware active (supports allow-list + *.vercel.app previews)');

// 1. CORS Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    const isVercelApp = typeof origin === 'string' && origin.endsWith('.vercel.app');
    const isListedOrigin = typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin);
    const isLocalOrigin = typeof origin === 'string' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
    const isProduction = process.env.NODE_ENV === 'production';

    if (isVercelApp || isListedOrigin || (!isProduction && isLocalOrigin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};
app.use(cors(corsOptions));

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

// 1.5 Database Connection Middleware - Root level fix for serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB_CONNECTION_FAILURE:', err.message);
    res.status(500).json({
      success: false,
      message: 'Initial server connection failure. Please try again in 5 seconds.',
      hint: 'MONGODB_URI connectivity issue'
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
app.use('/api/v1/assessments', assessmentRoute);
app.use('/api/blogs', blogRoute);
app.use('/api/v2/users', authLimiter, userRouteV2);
app.use('/api/v2/admin', adminRouteV2);

// Backward compatibility - default to v1
app.use('/api/users', authLimiter, userRouteV1);
app.use('/api/admin', adminRouteV1);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Healthy' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'Backend is running' });
});

// Root level status for Vercel diagnostics
app.get('/status', (req, res) => {
  res.json({ status: 'success', message: 'Backend is running (root)' });
});

// Error handling
app.use(errorHandler);

// Database connection - NO LONGER NEEDED HERE as it is handled by connectDB middleware
// connectionOptions moved to lib/db.js

// Export app immediately for Vercel
module.exports = app;

// Only listen if running locally or on Render
if (require.main === module || process.env.RENDER) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
