import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { useUser } from './UserContext';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { selectedUser, selectedGroup } = useUser();
  const { authUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const isGroupChat = !!selectedGroup;
  const currentChatId = selectedGroup?._id || selectedUser?._id;

  // Fetch messages for selected user or group
  const fetchMessages = useCallback(async () => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isGroupChat) {
        data = await apiService.getGroupMessages(selectedGroup._id);
      } else {
        data = await apiService.getMessages(selectedUser._id);
        
        // Mark messages as read when viewing conversation
        if (data && data.length > 0) {
          await markAsRead(selectedUser._id);
        }
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [currentChatId, isGroupChat, selectedUser?._id, selectedGroup?._id]);

  // Auto-fetch messages when selected user changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch unread counts
  const fetchUnreadCounts = useCallback(async () => {
    try {
      const data = await apiService.getUnreadCountPerUser();
      setUnreadCounts(data.unreadCounts || {});
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  }, []);

  // Fetch unread counts on mount and when auth user changes
  useEffect(() => {
    if (authUser) {
      fetchUnreadCounts();
    }
  }, [authUser, fetchUnreadCounts]);

  // Mark messages as read
  const markAsRead = useCallback(async (senderId) => {
    try {
      await apiService.markMessagesAsRead(senderId);
      
      // Update unread counts
      setUnreadCounts(prev => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  // Send a new message
  const sendMessage = useCallback(async (messageData, files = []) => {
    if (!currentChatId) return { success: false, error: 'No chat selected' };

    try {
      let data;
      if (isGroupChat) {
        data = await apiService.sendGroupMessage(selectedGroup._id, messageData, files);
      } else {
        data = await apiService.sendMessage(selectedUser._id, messageData, files);
      }

      const newMessage = data?.newMessage || data?.message;
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }

      return { success: true, data: newMessage };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }, [currentChatId, isGroupChat, selectedUser?._id, selectedGroup?._id]);

  // Add a new message (for real-time updates)
  const addMessage = useCallback((newMessage) => {
    setMessages(prev => [...prev, newMessage]);
    
    // Update unread count if message is from another user
    if (newMessage.senderId !== authUser?._id) {
      setUnreadCounts(prev => ({
        ...prev,
        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
      }));
    }
  }, [authUser?._id]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Get unread count for a specific user
  const getUnreadCount = useCallback((userId) => {
    return unreadCounts[userId] || 0;
  }, [unreadCounts]);

  // Delete message
  const deleteMessage = useCallback(async (messageId, forEveryone = false) => {
    try {
      if (forEveryone) {
        await apiService.deleteMessageForEveryone(messageId);
      } else {
        await apiService.deleteMessageForMe(messageId);
      }
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete message:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update message status
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, status, delivered: status === 'delivered' || status === 'read', read: status === 'read' } : msg
    ));
  }, []);

  // Add or update reaction
  const addReaction = useCallback(async (messageId, emoji) => {
    try {
      if (emoji) {
        await apiService.addReaction(messageId, emoji);
      } else {
        await apiService.removeReaction(messageId);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to add reaction:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update message reactions
  const updateMessageReactions = useCallback((messageId, reactions) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId ? { ...msg, reactions } : msg
    ));
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId, newMessage) => {
    try {
      await apiService.editMessage(messageId, newMessage);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, message: newMessage, edited: true, editedAt: new Date() } : msg
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to edit message:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    messages,
    setMessages,
    loading,
    fetchMessages,
    sendMessage,
    addMessage,
    clearMessages,
    unreadCounts,
    getUnreadCount,
    markAsRead,
    fetchUnreadCounts,
    deleteMessage,
    updateMessageStatus,
    addReaction,
    updateMessageReactions,
    editMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
