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
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
});

// Routes
const userRouteV1 = require('./routes/v1/user.route');
const adminRouteV1 = require('./routes/v1/admin.route');
const userRouteV2 = require('./routes/v2/user.route');
const adminRouteV2 = require('./routes/v2/admin.route');
const errorHandler = require('./middlewares/error.middleware');

app.use('/api/v1/users', authLimiter, userRouteV1);
app.use('/api/v1/admin', adminRouteV1);
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
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
