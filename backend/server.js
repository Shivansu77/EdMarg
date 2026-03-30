require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { setCorsHeaders } = require('./lib/withCors');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME || 'edmarg_db';

// 0. Base Configuration - Root level fixes for Vercel
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Hardcoded allowed origins for Vercel deployment
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://frontend-alpha-nine-92.vercel.app',
  'https://edmarg-frontend.vercel.app',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

console.log('✅ CORS Allowed Origins:', ALLOWED_ORIGINS);
console.log('🚀 Vercel Deployment: CORS Fix v1.0');

// 1. CORS Middleware - Layer 3 (Fallback)
app.use((req, res, next) => {
  setCorsHeaders(req, res);
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
if (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET) {
  console.warn('WARNING: Zoom environment variables are missing. Meeting generation will fail.');
}

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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
const userRouteV2 = require('./routes/v2/user.route');
const adminRouteV2 = require('./routes/v2/admin.route');
const errorHandler = require('./middlewares/error.middleware');

app.use('/api/v1/users', authLimiter, userRouteV1);
app.use('/api/v1/admin', adminRouteV1);
app.use('/api/v1/bookings', bookingRouteV1);
app.use('/api/v1/availability', availabilityRouteV1);
app.use('/api/v1/mentor', mentorRouteV1);
app.use('/api/v1/zoom', zoomRouteV1);
app.use('/api/v2/users', authLimiter, userRouteV2);
app.use('/api/v2/admin', adminRouteV2);

// Backward compatibility - default to v1
app.use('/api/users', authLimiter, userRouteV1);
app.use('/api/admin', adminRouteV1);

app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'Backend is running' });
});

// Error handling
app.use(errorHandler);

// Database connection
const connectionOptions = {
  dbName: DB_NAME,
  serverSelectionTimeoutMS: 10000, // Increased to 10s for Atlas
  connectTimeoutMS: 10000,        // 10s timeout for initial connection
  socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
  family: 4                       // Force IPv4 if needed
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db', connectionOptions)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Critical Error: MongoDB connection failed.', err.message);
    console.error('Verify your MONGODB_URI and ensuring it is accessible from your current environment.');
  });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
