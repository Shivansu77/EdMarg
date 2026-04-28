'use client';

/**
 * SocketProvider
 * ==============
 * React context that manages a Socket.io client connection.
 * Auto-connects when the user is authenticated, disconnects on logout.
 * Listens for `recording_ready` events and shows toast notifications.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect when a user is authenticated
    if (!user?._id) {
      // Disconnect existing socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Resolve the base URL (strip /api/v1 if present)
    const baseUrl = (resolveBackendBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

    const socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.io] Connection error:', err.message);
      setIsConnected(false);
    });

    // ── Listen for recording_ready events ──────────────────────────────
    socket.on('recording_ready', (data: {
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

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
