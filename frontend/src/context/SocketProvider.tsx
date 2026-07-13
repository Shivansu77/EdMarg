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
      const token = (await getToken()) || localStorage.getItem('token');
      if (!token || isCancelled) return;

      localStorage.setItem('token', token);

      // Resolve the base URL (strip /api/v1 if present)
      const baseUrl = (resolveBackendBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

      newSocket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
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
