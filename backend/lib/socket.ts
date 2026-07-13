// @ts-nocheck
/**
 * Socket.io Server Setup
 * ======================
 * Attaches Socket.io to the HTTP server with Clerk authentication.
 * Each authenticated user auto-joins a room named `user:<userId>`.
 *
 * Usage from controllers:
 *   const { getIO } = require('../lib/socket');
 *   getIO().to(`user:${studentId}`).emit('recording_ready', payload);
 */

const { Server } = require('socket.io');
const { handleChatEvents } = require('./chat.socket');
const userService = require('../services/user.service');

let io = null;

/**
 * Initialize Socket.io on the given HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const { ALLOWED_ORIGINS } = require('./withCors');

function initSocket(httpServer) {
  const allowedOrigins = ALLOWED_ORIGINS;

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
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const user = userService.sanitizeUser(await userService.syncClerkUserFromToken(token));
      socket.userId = String(user._id);
      socket.userRole = user.role;
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

    // Attach chat events
    handleChatEvents(io, socket);

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
