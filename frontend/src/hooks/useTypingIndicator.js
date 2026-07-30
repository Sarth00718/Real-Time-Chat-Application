import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';

export const useTypingIndicator = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { emit, on, off } = useSocket();
  const { selectedUser, selectedGroup } = useUser();
  const typingTimeoutRef = useRef(null);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback((typing) => {
    if (!selectedUser?._id && !selectedGroup?._id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      if (selectedUser?._id) {
        emit('typing', { receiverId: selectedUser._id, isTyping: true });
      } else if (selectedGroup?._id) {
        emit('groupTyping', { groupId: selectedGroup._id, isTyping: true });
      }
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedUser?._id) {
          emit('typing', { receiverId: selectedUser._id, isTyping: false });
        } else if (selectedGroup?._id) {
          emit('groupTyping', { groupId: selectedGroup._id, isTyping: false });
        }
        setIsTyping(false);
      }, 3000);
    } else {
      if (selectedUser?._id) {
        emit('typing', { receiverId: selectedUser._id, isTyping: false });
      } else if (selectedGroup?._id) {
        emit('groupTyping', { groupId: selectedGroup._id, isTyping: false });
      }
    }

    setIsTyping(typing);
  }, [selectedUser?._id, selectedGroup?._id, emit]);

  // Listen for typing events
  useEffect(() => {
    setTypingUsers(new Set()); // Reset when switching chats
    
    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId === selectedUser?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) newSet.add(userId);
          else newSet.delete(userId);
          return newSet;
        });
      }
    };

    const handleGroupTyping = ({ userId, groupId, isTyping }) => {
      if (groupId === selectedGroup?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) newSet.add(userId);
          else newSet.delete(userId);
          return newSet;
        });
      }
    };

    on('userTyping', handleUserTyping);
    on('userGroupTyping', handleGroupTyping);

    return () => {
      off('userTyping', handleUserTyping);
      off('userGroupTyping', handleGroupTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedUser?._id, selectedGroup?._id, on, off]);

  const isUserTyping = selectedGroup?._id 
    ? typingUsers.size > 0 
    : typingUsers.has(selectedUser?._id);

  return {
    isTyping,
    isUserTyping,
    sendTypingIndicator
  };
};
