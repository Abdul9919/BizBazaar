import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      console.log('No user token available');
      return;
    }

    console.log('Initializing socket with token:', user.token);
    
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token: user.token },
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 3,
      autoConnect: true // Let socket.io handle connection timing
    });

    const handleConnect = () => {
      console.log('Socket connected:', socketRef.current?.id);
      setIsConnected(true);
      socketRef.current.emit('join', user.id);
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    };

    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('disconnect', handleDisconnect);

    // Mark initialization complete
    setIsInitialized(true);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('disconnect', handleDisconnect);
        socketRef.current.disconnect();
      }
    };
  }, [user?.token, user?.id]); // Reconnect when token or user ID changes

  return (
    <SocketContext.Provider value={{ 
      socket: isInitialized ? socketRef.current : null,
      isConnected 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};