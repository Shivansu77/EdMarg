'use client';

/**
 * SocketProvider
 * ==============
 * React context that manages a Socket.io client connection.
 * Auto-connects when the user is authenticated, disconnects on logout.
 * Listens for `recording_ready` events and shows toast notifications.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { resolveBackendBaseUrl } from '@/utils/api-base';
import { persistLegacyToken } from '@/utils/auth-session';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { getToken } = useClerkAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let newSocket: Socket | null = null;
    let isCancelled = false;

    // Only connect when a user is authenticated
    if (!user?._id) {
      setIsConnected(false);
      return;
    }

    const connectSocket = async () => {
      const token = await getToken();
      if (!token || isCancelled) return;

      persistLegacyToken(token);

      // Resolve the base URL (strip /api/v1 if present)
      const baseUrl = (resolveBackendBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

      newSocket = io(baseUrl, {
        auth: { token },
        // Poll first, then upgrade. A hibernating backend rejects the WebSocket
        // handshake outright (503), whereas polling degrades gracefully and lets
        // the transport upgrade once the instance is actually serving traffic.
        transports: ['polling', 'websocket'],
        reconnection: true,
        // A cold start can take 30-60s, so give up only after a much longer
        // window than the default handful of quick attempts.
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 15000,
        randomizationFactor: 0.5,
        timeout: 20000,
      });

      // Clerk session tokens are short-lived (about a minute), so the token
      // captured above is usually stale by the time a reconnect happens. Each
      // attempt has to carry a freshly minted token or the server rejects the
      // handshake with "Invalid or expired token" and never recovers.
      newSocket.io.on('reconnect_attempt', () => {
        void getToken()
          .then((freshToken) => {
            if (freshToken && newSocket) {
              newSocket.auth = { token: freshToken };
              persistLegacyToken(freshToken);
            }
          })
          .catch(() => {
            // Keep the existing token; the next attempt will try again.
          });
      });


      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[Socket.io] Connected:', newSocket?.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('[Socket.io] Disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('[Socket.io] Connection error:', err.message);
        setIsConnected(false);
      });

      newSocket.on('recording_ready', (data: {
        type: string;
        sessionId: string;
        message: string;
      }) => {
        toast.success(data.message || 'Your session recording is ready!', {
          duration: 8000,
          icon: '🎬',
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
          },
        });
      });

      // ── Listen for new_booking_request events ────────────────────────
      newSocket.on('new_booking_request', (data: {
        type: string;
        title: string;
        message: string;
        bookingId: string;
      }) => {
        toast.success(data.message || 'You have a new session request!', {
          duration: 8000,
          icon: '🔔',
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
          },
        });
      });
    };

    void connectSocket();

    return () => {
      isCancelled = true;
      newSocket?.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [getToken, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
