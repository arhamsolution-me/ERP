import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRealtimeOptions {
  url: string;
  token: string;
  tenantId: string;
  room: string;
  onEvent: (event: string, payload: any) => void;
  onReconnect?: () => void; // Used to trigger a REST API fetch to reconcile missed events
}

export function useRealtimeChannel({ url, token, tenantId, room, onEvent, onReconnect }: UseRealtimeOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.io connection with JWT Token
    socketRef.current = io(url, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      
      // Subscribe to the tenant-scoped room
      socket.emit('subscribeToRoom', { tenantId, room });

      // Trigger reconciliation fetch if recovering from a drop
      if (onReconnect) {
        onReconnect();
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Generic event listener for the subscribed room
    socket.on('roomEvent', (data: { event: string; payload: any }) => {
      onEvent(data.event, data.payload);
    });

    return () => {
      socket.emit('unsubscribeFromRoom', { tenantId, room });
      socket.disconnect();
    };
  }, [url, token, tenantId, room, onEvent, onReconnect]);

  const manuallyReconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    manuallyReconnect,
  };
}
