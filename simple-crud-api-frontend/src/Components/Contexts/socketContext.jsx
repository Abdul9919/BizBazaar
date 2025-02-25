import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth(); // Get the user object from the AuthContext
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState([]); // Store notifications

  useEffect(() => {
    // Only initialize the socket if the user is authenticated and has a token
    if (user?.token) {
      // Initialize the socket connection
      socketRef.current = io(process.env.REACT_APP_API_URL, {
        withCredentials: true,
        transports: ["websocket"],
        auth: { token: user.token }, // Use the user's token for authentication
        path: "/socket.io",
        reconnection: true,
        reconnectionAttempts: 3,
        autoConnect: true,
      });

      // Event listener for socket connection
      const handleConnect = () => {
        setIsConnected(true);
        socketRef.current.emit("join", user.id); // Join the user's room
      };

      // Event listener for socket disconnection
      const handleDisconnect = (reason) => {
        setIsConnected(false);
      };

      // Event listener for new notifications
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [...prev, notification]); // Append new notification
      };

      // Attach event listeners only after the socket is initialized
      if (socketRef.current) {
        socketRef.current.on("connect", handleConnect);
        socketRef.current.on("disconnect", handleDisconnect);
        socketRef.current.on("receive_notification", handleNewNotification);
      }

      setIsInitialized(true);

      // Cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off("connect", handleConnect);
          socketRef.current.off("disconnect", handleDisconnect);
          socketRef.current.off("receive_notification", handleNewNotification);
          socketRef.current.disconnect();
        }
      };
    }
  }, [user?.token, user?.id]); // Re-run effect if user.token or user.id changes

  return (
    <SocketContext.Provider
      value={{
        socket: isInitialized ? socketRef.current : null,
        isConnected,
        notifications, // Provide notifications state
        setNotifications, // Allow updates from other components
      }}
    >
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