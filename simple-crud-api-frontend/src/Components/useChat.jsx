import { useEffect, useState } from 'react';
import { useSocket } from './socketContext';

export const useChat = (selectedUserId) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  // Message handling
  useEffect(() => {
    if (!socket || !selectedUserId) return;

    const messageHandler = (message) => {
      setMessages(prev => [message, ...prev]);
    };

    const errorHandler = (err) => setError(err);

    socket.on('receiveMessage', messageHandler);
    socket.on('messageError', errorHandler);

    return () => {
      socket.off('receiveMessage', messageHandler);
      socket.off('messageError', errorHandler);
    };
  }, [socket, selectedUserId]);

  const sendMessage = async (content) => {
    if (!socket || !selectedUserId || !content.trim()) return;

    try {
      const messageData = {
        receiverId: selectedUserId,
        content: content.trim()
      };

      socket.emit('sendMessage', messageData);
      
      // Optimistic update
      setMessages(prev => [{
        sender: socket.id,
        receiver: selectedUserId,
        content: content.trim(),
        timestamp: new Date()
      }, ...prev]);

    } catch (err) {
      setError('Failed to send message');
    }
  };

  return { messages, sendMessage, isConnected, error };
};