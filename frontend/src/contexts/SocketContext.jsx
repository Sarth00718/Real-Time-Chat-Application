import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { useChat } from './ChatContext';
import { socketService } from '../services/socketService';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuth();
  const { setOnlineUsers, setGroups, selectedGroup, setSelectedGroup } = useUser();
  const { addMessage, fetchMessages, selectedUser, updateMessageStatus, markMessagesAsReadBy, updateMessagePinned, setMessages, updateMessageReactions } = useChat();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Re-fetch data after reconnection
  const handleReconnection = useCallback(async () => {
    console.log('Socket reconnected - refreshing data...');
    
    // Re-fetch messages for current conversation
    if (selectedUser?._id) {
      try {
        await fetchMessages();
      } catch (error) {
        console.error('Failed to refresh messages:', error);
      }
    }
    
    // Reset reconnect attempts
    reconnectAttemptsRef.current = 0;
  }, [selectedUser?._id, fetchMessages]);

  // Initialize socket connection
  useEffect(() => {
    if (authUser?._id) {
      // Connect socket
      socketRef.current = socketService.connect(authUser._id);

      // Setup event listeners
      setupSocketListeners();

      // Cleanup on unmount or auth change
      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        socketService.disconnect();
        socketRef.current = null;
        reconnectAttemptsRef.current = 0;
      };
    } else {
      // Disconnect if no auth user
      socketService.disconnect();
      socketRef.current = null;
      reconnectAttemptsRef.current = 0;
    }
  }, [authUser?._id]);

  // Setup all socket event listeners
  const setupSocketListeners = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle online users updates
    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users || []);
    });

    // Handle new messages
    socket.on('newMessage', (newMessage) => {
      // Always call addMessage, it will smartly route to active chat or unread counts
      addMessage(newMessage);
      
      // Emit delivered status if we're the receiver
      if (newMessage.receiverId === authUser?._id) {
        socket.emit('messageDelivered', {
          messageId: newMessage._id,
          receiverId: newMessage.senderId
        });
      }
    });

    // Handle new group messages
    socket.on('newGroupMessage', ({ groupId, message }) => {
      addMessage(message);
    });

    // Handle messages read
    socket.on('messagesRead', ({ readBy }) => {
      if (typeof markMessagesAsReadBy === 'function') {
        markMessagesAsReadBy(readBy);
      }
    });

    // Handle message pinned
    socket.on('messagePinned', ({ messageId }) => {
      if (typeof updateMessagePinned === 'function') {
        updateMessagePinned(messageId, true);
      }
    });

    // Handle message unpinned
    socket.on('messageUnpinned', ({ messageId }) => {
      if (typeof updateMessagePinned === 'function') {
        updateMessagePinned(messageId, false);
      }
    });

    // Handle group updates
    socket.on('addedToGroup', (group) => {
      if (typeof setGroups === 'function') {
        setGroups(prev => [...prev, group]);
      }
    });

    socket.on('groupUpdated', (updatedGroup) => {
      if (typeof setGroups === 'function') {
        setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
      }
      if (selectedGroup?._id === updatedGroup._id && typeof setSelectedGroup === 'function') {
        setSelectedGroup(updatedGroup);
      }
    });

    socket.on('removedFromGroup', ({ groupId }) => {
      if (typeof setGroups === 'function') {
        setGroups(prev => prev.filter(g => g._id !== groupId));
      }
      if (selectedGroup?._id === groupId && typeof setSelectedGroup === 'function') {
        setSelectedGroup(null);
      }
    });

    // Handle message status updates
    socket.on('messageStatusUpdate', ({ messageId, status }) => {
      // Update message status in chat context
      if (typeof updateMessageStatus === 'function') {
        updateMessageStatus(messageId, status);
      }
    });

    // Handle message deleted for everyone
    socket.on('messageDeletedForEveryone', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    // Handle user online status
    socket.on('userOnline', (userId) => {
      console.log(`User ${userId} is now online`);
    });

    // Handle user offline status
    socket.on('userOffline', (userId) => {
      console.log(`User ${userId} is now offline`);
    });

    // Handle message reactions
    socket.on('messageReaction', ({ messageId, reactions }) => {
      updateMessageReactions(messageId, reactions);
    });

    // Handle message edited
    socket.on('messageEdited', ({ messageId, message, edited, editedAt }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, message, edited, editedAt } : msg
      ));
    });

    // Handle successful connection
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      
      // If this is a reconnection, refresh data
      if (reconnectAttemptsRef.current > 0) {
        handleReconnection();
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      
      // If disconnected due to server, attempt reconnection
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, manually reconnect
        socket.connect();
      }
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      reconnectAttemptsRef.current++;
      
      // Attempt reconnection with exponential backoff
      if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`Attempting reconnection ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (authUser?._id) {
            socketService.reconnect();
          }
        }, delay);
      } else {
        console.error('Max reconnection attempts reached. Please refresh the page.');
      }
    });

    // Handle reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}...`);
    });

    // Handle successful reconnection
    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      handleReconnection();
    });

    // Handle reconnection failure
    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
    });

  }, [authUser?._id, selectedUser?._id, selectedGroup?._id, setOnlineUsers, addMessage, handleReconnection, updateMessageStatus, markMessagesAsReadBy, updateMessagePinned, setMessages, updateMessageReactions, setGroups, setSelectedGroup]);

  // Update listeners when selectedUser changes
  useEffect(() => {
    if (socketRef.current) {
      // Remove old listeners
      socketRef.current.off('newMessage');
      socketRef.current.off('newGroupMessage');
      
      // Re-setup listeners with new selectedUser
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('newMessage', (newMessage) => {
          addMessage(newMessage);
          
          if (newMessage.receiverId === authUser?._id) {
            socket.emit('messageDelivered', {
              messageId: newMessage._id,
              receiverId: newMessage.senderId
            });
          }
        });
        
        socket.on('newGroupMessage', ({ groupId, message }) => {
          addMessage(message);
        });
      }
    }
  }, [selectedUser?._id, selectedGroup?._id, authUser?._id, addMessage]);

  // Emit a socket event
  const emit = useCallback((event, data) => {
    socketService.emit(event, data);
  }, []);

  // Listen to a socket event
  const on = useCallback((event, callback) => {
    socketService.on(event, callback);
  }, []);

  // Remove a socket event listener
  const off = useCallback((event, callback) => {
    socketService.off(event, callback);
  }, []);

  const value = {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketService.isConnected()
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
