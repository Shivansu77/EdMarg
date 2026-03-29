require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const DB_NAME = process.env.DB_NAME || 'edmarg_db';

// Security middleware
app.use(helmet());

// Critical environment checks
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
}

const corsOrigins = [
  'http://localhost:3000',
  'https://frontend-alpha-nine-92.vercel.app',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'X-CSRF-Token', 
    'X-Requested-With', 
    'Accept', 
    'Accept-Version', 
    'Content-Length', 
    'Content-MD5', 
    'Content-Type', 
    'Date', 
    'X-Api-Version', 
    'Authorization'
  ],
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for development convenience
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db', {
  dbName: DB_NAME,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
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
