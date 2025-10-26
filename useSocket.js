import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(token) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); };
  }, [token]);

  return { socket: socketRef.current, connected };
}
