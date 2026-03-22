import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';

export const useTypingIndicator = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { emit, on, off } = useSocket();
  const { selectedUser } = useUser();
  const typingTimeoutRef = useRef(null);

  // Send typing indicator with debounce
  const sendTypingIndicator = useCallback((typing) => {
    if (!selectedUser?._id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      emit('typing', { receiverId: selectedUser._id, isTyping: true });
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        emit('typing', { receiverId: selectedUser._id, isTyping: false });
        setIsTyping(false);
      }, 3000);
    } else {
      emit('typing', { receiverId: selectedUser._id, isTyping: false });
    }

    setIsTyping(typing);
  }, [selectedUser?._id, emit]);

  // Listen for typing events
  useEffect(() => {
    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId === selectedUser?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    };

    on('userTyping', handleUserTyping);

    return () => {
      off('userTyping', handleUserTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedUser?._id, on, off]);

  const isUserTyping = typingUsers.has(selectedUser?._id);

  return {
    isTyping,
    isUserTyping,
    sendTypingIndicator
  };
};
