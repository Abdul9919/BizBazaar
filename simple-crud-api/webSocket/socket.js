import { Server } from 'socket.io';
import socketHandlers from './socketHandler.js';

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
    'http://localhost:3000',
    'http://192.168.18.41:3000' // Replace with your local IP
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["authorization", "Cache-Control"]
    },
    transports: ['websocket', 'polling']
  });

  // Connection logging
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  socketHandlers(io);
  
  console.log('Socket.IO initialized with allowed origins:', allowedOrigins);
  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

export { initSocket, getIo };