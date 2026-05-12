const mongoose = require('mongoose');

/**
 * Global is used here to maintain a cached connection across hot-reloads
 * in development and across function invocations in serverless (Vercel).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, listenersAttached: false };
}

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toNonNegativeInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

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
      // Pool tuning:
      // - Avoid starvation under concurrent API traffic.
      // - Keep enough warm sockets in production.
      // - Let queued operations wait a bit longer before failing.
      maxPoolSize: toPositiveInt(process.env.MONGODB_MAX_POOL_SIZE, process.env.NODE_ENV === 'production' ? 20 : 12),
      minPoolSize: toNonNegativeInt(process.env.MONGODB_MIN_POOL_SIZE, process.env.NODE_ENV === 'production' ? 2 : 0),
      maxConnecting: toPositiveInt(process.env.MONGODB_MAX_CONNECTING, 4),
      maxIdleTimeMS: toNumber(process.env.MONGODB_MAX_IDLE_TIME_MS, 60000),
      waitQueueTimeoutMS: toPositiveInt(process.env.MONGODB_WAIT_QUEUE_TIMEOUT_MS, 20000),
      serverSelectionTimeoutMS: toNumber(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 8000),
      connectTimeoutMS: toNumber(process.env.MONGODB_CONNECT_TIMEOUT_MS, 10000),
      socketTimeoutMS: toNumber(process.env.MONGODB_SOCKET_TIMEOUT_MS, 60000),
      heartbeatFrequencyMS: toPositiveInt(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS, 10000),
      retryReads: true,
      retryWrites: true,
      autoIndex: process.env.NODE_ENV !== 'production',
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
    console.log(
      `📦 Mongo pool config: maxPoolSize=${opts.maxPoolSize}, minPoolSize=${opts.minPoolSize}, maxConnecting=${opts.maxConnecting}, waitQueueTimeoutMS=${opts.waitQueueTimeoutMS}`
    );
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
