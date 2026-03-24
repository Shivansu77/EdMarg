require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const DB_NAME = process.env.DB_NAME || 'edmarg_db';

// Middleware
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route Files
const userRoute = require('./routes/user.route');
const errorHandler = require('./middlewares/error.middleware');

// Routes
app.use('/api/users', userRoute);

app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'Backend is running and connected successfully!' });
});


// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edmarg_db', { dbName: DB_NAME })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
