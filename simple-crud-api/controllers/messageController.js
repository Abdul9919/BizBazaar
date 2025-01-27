import Message from '../models/messageModel.js'
import mongoose from 'mongoose'
const getMessageHistory = async (req, res) => {
    try {
      const { userId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
  
      // Validate user ID format
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
  
      const currentUserId = req.user._id;
  
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId }
        ]
      })
      .sort({ timestamp: -1 }) // Get newest first for pagination
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name _id') // Populate sender details
      .populate('receiver', 'name _id') // Populate receiver details
      .lean();
  
      // Convert MongoDB objects to plain objects
      const formattedMessages = messages.map(message => ({
        ...message,
        sender: message.sender._id.toString(), // Convert to string ID
        receiver: message.receiver._id.toString(),
        timestamp: message.timestamp.toISOString()
      }));
  
      res.json({ messages: formattedMessages.reverse() }); // Reverse for correct order
  
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  };
export { getMessageHistory }