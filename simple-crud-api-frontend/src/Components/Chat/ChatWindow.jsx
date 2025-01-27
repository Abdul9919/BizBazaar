import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../Contexts/socketContext';
import { useAuth } from '../Contexts/AuthContext';
import axios from 'axios'

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debug selectedUser changes

  const token = user?.token; // Define the token variable


  useEffect(() => {
    if (selectedUser?.id) {
      setPage(1);
      setMessages([]);
      fetchChatHistory();
    }
  }, [selectedUser?.id]);
  const fetchChatHistory = useCallback(async () => {
    if (!selectedUser?.id || !user?.id || !hasMoreMessages) return;

    try {
      setIsLoadingHistory(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          params: {
            userId: selectedUser.id,
            page,
            limit: 20
          },
          headers: { authorization: `Bearer ${token}` }
        }
      );

      setMessages(prev => {
        // Filter out duplicates
        const newMessages = response.data.messages.filter(
          newMsg => !prev.some(existingMsg => existingMsg._id === newMsg._id)
        );
        return [...newMessages, ...prev]; // Prepend older messages
      });

      setHasMoreMessages(response.data.messages.length === 20);
    } catch (error) {
      console.error('History error:', error);
      setError(error.response?.data?.error || 'Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [selectedUser?.id, user?.id, token, page, hasMoreMessages]);

  const handleScroll = useCallback(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (!container || isLoadingHistory || !hasMoreMessages) return;

    // Load more when scrolled near top
    if (container.scrollTop < 100) {
      setPage(prev => prev + 1);
    }
  }, [isLoadingHistory, hasMoreMessages]);

  // Add scroll listener
  useEffect(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      // Smooth scroll to bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);


  useEffect(() => {
    console.log('SelectedUser details:', {
      id: selectedUser?.id,
      type: typeof selectedUser?.id,
      valid: selectedUser?.id ? /^[0-9a-fA-F]{24}$/.test(selectedUser.id) : false
    });
  }, [selectedUser]);

  // Message handling
  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    console.log('Send button clicked');

    // Validate input conditions
    if (!messageInput.trim() || !selectedUser?.id || !socket || isSending) {
      console.log('Blocked send attempt. Reasons:', {
        hasInput: !!messageInput.trim(),
        validUser: !!selectedUser?.id,
        socketConnected: !!socket,
        isSending
      });
      return;
    }

    // Validate user ID format
    if (!/^[0-9a-fA-F]{24}$/.test(selectedUser.id)) {
      console.error('Invalid MongoDB ID:', selectedUser.id);
      setError('Invalid recipient ID');
      return;
    }

    const tempId = Date.now();
    const tempMessage = {
      _id: tempId,
      sender: user.id,
      receiver: selectedUser.id,
      content: messageInput.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    try {
      setIsSending(true);
      setError(null);
      setMessageInput('');
      setMessages(prev => [...prev, {
        ...tempMessage,
        timestamp: new Date(tempMessage.timestamp)
      }]);

      socket.emit('sendMessage',
        {
          receiverId: selectedUser.id,
          content: messageInput.trim()
        },
        (response) => {
          console.log('Server response:', response);
          if (response.status === 'error') {
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            setError(response.message);
            return;
          }

          // Update message with server response
          setMessages(prev => prev.map(msg =>
            msg._id === tempId ? {
              ...response.message,
              status: 'delivered'
            } : msg
          ));
        }
      );

    } catch (err) {
      console.error('Send failed:', err);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setMessageInput(messageInput);
      setError(err.message.includes('Receiver not found')
        ? 'User is no longer available'
        : 'Failed to send message'
      );
    } finally {
      setIsSending(false);
    }
  }, [socket, selectedUser, messageInput, user?.id, isSending]);

  // Message listener
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message) => {
      const parsedMessage = {
        ...message,
        timestamp: new Date(message.timestamp)
      };

    };

    socket.on('receiveMessage', messageHandler);
    return () => socket.off('receiveMessage', messageHandler);
  }, [socket]);

  // Connection error handling

  // Socket error handling
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (message) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        return exists ? prev : [...prev, message];
      });
    };

    socket.on('receiveMessage', messageHandler);
    return () => socket.off('receiveMessage', messageHandler);
  }, [socket]);


  // Typing indicator
  useEffect(() => {
    if (!socket || !selectedUser?.id) return;

    let timeout;
    const handleTyping = () => {
      socket.emit('typing', selectedUser.id);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        socket.emit('stopTyping', selectedUser.id);
      }, 1000);
    };

    const typingHandler = (userId) => {
      if (userId === selectedUser.id) setIsTyping(true);
    };

    const stopTypingHandler = (userId) => {
      if (userId === selectedUser.id) setIsTyping(false);
    };

    socket.on('typing', typingHandler);
    socket.on('stopTyping', stopTypingHandler);

    return () => {
      socket.off('typing', typingHandler);
      socket.off('stopTyping', stopTypingHandler);
      clearTimeout(timeout);
    };
  }, [socket, selectedUser]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border rounded-lg overflow-hidden bg-gray-50">
      {/* Connection Status */}
      <div className={`p-2 text-sm ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isConnected ? 'Connected ✅' : `Disconnected ❌`}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {selectedUser?.name?.[0] ?? '?'}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold">{selectedUser?.name ?? 'Unknown User'}</h2>
            {isTyping && <p className="text-sm text-gray-500">typing...</p>}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory && (
          <div className="text-center text-gray-500 p-4">
            <div className="animate-pulse">
              Loading older messages...
            </div>
          </div>
        )}

        {messages
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs p-3 rounded-lg relative ${msg.sender === user.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
                } ${msg.status === 'sending' ? 'opacity-75' : ''}`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender === user.id
                    ? 'text-blue-100'
                    : 'text-gray-500'
                  }`}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                  {msg.status === 'sending' && ' · Sending...'}
                </p>
              </div>
            </div>
          ))}

        {!hasMoreMessages && messages.length > 0 && (
          <div className="text-center text-gray-500 p-4 border-t">
            No older messages available
          </div>
        )}
      </div>

      {isLoadingHistory && (
        <div className="text-center p-4 text-gray-500">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {messages.length === 0 && !isLoadingHistory && (
        <div className="text-center p-4 text-gray-500">
          Start the conversation! No messages yet.
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected || isSending}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!isConnected || !messageInput.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;