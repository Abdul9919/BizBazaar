import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

export default function socketHandlers(io) {
    // Middleware for socket authentication
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
        socket.join(socket.userId); // Join user-specific room

        // Handle sending messages
        socket.on('sendMessage', async (messageData, callback) => {
            console.log('Received sendMessage event:', {
                from: socket.userId,
                data: messageData
            });

            try {
                // Validate receiver ID format
                if (!mongoose.Types.ObjectId.isValid(messageData.receiverId)) {
                    throw new Error('Invalid receiver ID format');
                }

                // Fetch sender and receiver details
                const sender = await User.findById(socket.userId).select('userName');
                if (!sender) throw new Error('Sender not found');

                const receiver = await User.findById(messageData.receiverId).select('userName');
                if (!receiver) throw new Error('Receiver not found');

                // Create message document
                const newMessage = await Message.create({
                    sender: socket.userId,
                    receiver: messageData.receiverId,
                    content: messageData.content.trim(),
                    timestamp: new Date()
                });

                // Prepare message payload
                const messagePayload = {
                    _id: newMessage._id.toString(),
                    sender: {
                        id: socket.userId.toString(),
                        username: sender.userName
                    },
                    receiver: {
                        id: messageData.receiverId.toString(),
                        username: receiver.userName
                    },
                    content: newMessage.content,
                    timestamp: newMessage.timestamp
                };

                // Send to both sender and receiver
                io.to(messageData.receiverId).emit('receiveMessage', messagePayload);
                io.to(socket.userId).emit('messageSent', messagePayload);

                // Callback response to sender
                callback({ status: 'success', message: messagePayload });

                console.log('📩 Message sent:', {
                    sender: sender.userName,
                    receiver: receiver.userName,
                    content: messageData.content
                });

                // Emit notification only if receiver is online
                const receiverSockets = await io.in(messageData.receiverId).fetchSockets();

                if (receiverSockets.length > 0) {
                    io.to(messageData.receiverId).emit("receive_notification", {
                        senderId: socket.userId,
                        senderUsername: sender.userName,
                        message: messageData.content,
                        text: `New message from ${sender.userName}`
                    });
                } else {
                    console.log(`🚫 Receiver ${messageData.receiverId} is offline, notification skipped.`);
                }

            } catch (error) {
                console.error('❌ Message error:', error.message);
                callback({
                    status: 'error',
                    message: error.message,
                    code: error instanceof mongoose.Error.ValidationError ? 'VALIDATION_ERROR' : 'SERVER_ERROR'
                });
            }
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.userId}`);
            socket.leave(socket.userId);
        });
    });
}
