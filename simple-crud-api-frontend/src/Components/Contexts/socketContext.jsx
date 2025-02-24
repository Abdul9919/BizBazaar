import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState([]); // Store notifications

  useEffect(() => {
    if (!user?.token) {
      console.log("No user token available");
      return;
    }

    socketRef.current = io(process.env.REACT_APP_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
      auth: { token: user.token },
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 3,
      autoConnect: true,
    });

    const handleConnect = () => {
      console.log("Socket connected:", socketRef.current?.id);
      setIsConnected(true);
      socketRef.current.emit("join", user.id);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [...prev, notification]); // Append new notification
    };

    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);
    socketRef.current.on("receive_notification", handleNewNotification); // Listen for notifications

    setIsInitialized(true);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", handleConnect);
        socketRef.current.off("disconnect", handleDisconnect);
        socketRef.current.off("receive_notification", handleNewNotification);
        socketRef.current.disconnect();
      }
    };
  }, [user?.token, user?.id]);

  return (
    <SocketContext.Provider value={{ 
      socket: isInitialized ? socketRef.current : null,
      isConnected,
      notifications, // Provide notifications state
      setNotifications // Allow updates from other components
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
