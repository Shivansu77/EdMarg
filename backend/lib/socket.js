/**
 * Socket.io Server Setup
 * ======================
 * Attaches Socket.io to the HTTP server with JWT-based authentication.
 * Each authenticated user auto-joins a room named `user:<userId>`.
 *
 * Usage from controllers:
 *   const { getIO } = require('../lib/socket');
 *   getIO().to(`user:${studentId}`).emit('recording_ready', payload);
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow exact match
        if (allowedOrigins.includes(origin)) return callback(null, true);

        // Allow Vercel preview deployments
        if (/\.vercel\.app$/.test(origin)) return callback(null, true);

        callback(new Error(`Socket.io CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Auth Middleware ──────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      console.warn('[Socket.io] Auth failed:', err.message);
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection Handler ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const room = `user:${userId}`;

    // Join personal room
    socket.join(room);
    console.log(`[Socket.io] User ${userId} connected (socket: ${socket.id})`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] User ${userId} disconnected: ${reason}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

/**
 * Get the active Socket.io server instance.
 * Returns null if not yet initialized (safe to call before init).
 *
 * @returns {import('socket.io').Server | null}
 */
function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
