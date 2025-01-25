import jwt from 'jsonwebtoken';
import Message from '../models/messageModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

export default function socketHandlers(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.log('⚠️ No token provided');
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded.id) {
                console.log('❌ Invalid token payload:', decoded);
                return next(new Error('Invalid token format'));
            }

            console.log(`✅ Authenticated user: ${decoded.id}`);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            console.error('Auth error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`💻 Socket connected: ${socket.userId}`);
        socket.join(socket.userId);

        // Add validation for receiver ID format
        socket.on('sendMessage', async (messageData, callback) => {
            console.log('Received sendMessage event:', {
                from: socket.userId,
                data: messageData
            })
            try {
                
                // Validate receiver ID format
                if (!mongoose.Types.ObjectId.isValid(messageData.receiverId)) {
                    throw new Error('Invalid receiver ID format');
                }
                const receiver = await User.findById(messageData.receiverId);
        if (!receiver) {
          throw new Error('Receiver not found');
        }

                // Convert to ObjectId once
                const receiverId = new mongoose.Types.ObjectId(messageData.receiverId);

                // Check if receiver exists
                const receiverExists = await User.exists({ _id: receiverId });
                if (!receiverExists) {
                    throw new Error('Receiver not found');
                }

                // Create message document
                const newMessage = await Message.create({
                    sender: socket.userId,
                    receiver: messageData.receiverId,
                    content: messageData.content.trim(),
                    timestamp: new Date()
                });

                // Prepare response with proper ObjectId strings
                const messagePayload = {
                    _id: newMessage._id.toString(),
                    sender: socket.userId.toString(),  // Ensure string format
                    receiver: receiverId.toString(),   // Ensure string format
                    content: newMessage.content,
                    timestamp: newMessage.timestamp
                };

                // Send to receiver's room AND sender's room
                io.to(messageData.receiverId).emit('receiveMessage', messagePayload);
                io.to(socket.userId).emit('messageSent', messagePayload); // Confirm to sender

                callback({ status: 'success', message: messagePayload });

                console.log('Creating message:', {
                    sender: socket.userId,
                    receiver: messageData.receiverId,
                    content: messageData.content
                });

            } catch (error) {
                console.error('Message error:', error.message);
                callback({
                    status: 'error',
                    message: error.message,
                    code: error instanceof mongoose.Error.ValidationError ? 'VALIDATION_ERROR' : 'SERVER_ERROR'
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.userId}`);
            socket.leave(socket.userId);
        });
    });
}