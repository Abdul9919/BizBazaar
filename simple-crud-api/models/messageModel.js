import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
  },
    timestamp: { type: Date, default: Date.now }
  });
  
  const Message = mongoose.model('Message', messageSchema);
  export default Message