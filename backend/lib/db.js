const mongoose = require('mongoose');

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development and across function invocations in serverless (Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, listenersAttached: false };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME || 'edmarg_db';

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }

  if (cached.conn) {
    // `cached.conn` can exist while the underlying connection is disconnected in
    // serverless environments. Only reuse when Mongoose is actually "ready".
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using cached MongoDB connection (connected)');
      return cached.conn;
    }
    console.warn(
      `⚠️ Cached MongoDB connection is not ready (readyState=${mongoose.connection.readyState}). Reconnecting...`
    );
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    // Ensure we fail fast instead of letting Mongoose buffer for 10s+.
    // This prevents requests from timing out with: "buffering timed out".
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME,
      // Timeouts are important for serverless; tune via env if needed.
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 5000),
      family: 4 // Force IPv4 to solve ETIMEOUT in Node.js > 18
    };

    if (!cached.listenersAttached) {
      cached.listenersAttached = true;
      mongoose.connection.on('disconnected', () => {
        cached.conn = null;
        cached.promise = null;
        console.warn('🛑 MongoDB connection disconnected. Clearing cache.');
      });
      mongoose.connection.on('error', (err) => {
        cached.conn = null;
        cached.promise = null;
        console.error('❌ MongoDB connection error. Clearing cache:', err?.message || err);
      });
    }

    console.log('⏳ Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      if (mongoose.connection.readyState !== 1) {
        throw new Error(`MongoDB not ready after connect (readyState=${mongoose.connection.readyState})`);
      }
      cached.conn = mongoose.connection;
      console.log('✅ New MongoDB connection established');
      return cached.conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
