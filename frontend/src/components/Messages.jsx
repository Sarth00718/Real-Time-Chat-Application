import React, { useEffect, useRef, useState } from 'react';
import Message from './Message.jsx';
import useGetMessages from '../hook/useGetMessages.jsx';
import { useSelector } from 'react-redux';
import useGetRealTimeMessage from '../hook/useGetRealtimeMessage.jsx';
import { motion } from 'framer-motion';

function Messages() {
  useGetRealTimeMessage();
  useGetMessages();
  const { messages } = useSelector(store => store.message);
  const { selectedUser } = useSelector(store => store.user);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date for better display
  const groupMessagesByDate = () => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) return [];
    
    const groupedMessages = [];
    let currentDate = null;
    
    messages.forEach((msg) => {
      // Skip invalid messages
      if (!msg || !msg._id) return;
      
      // Make sure we have a valid date
      const messageDate = new Date(msg.createdAt || msg.timestamp || Date.now());
      if (isNaN(messageDate.getTime())) return; // Skip if date is invalid
      
      const dateStr = messageDate.toLocaleDateString();
      
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groupedMessages.push({
          type: 'date',
          value: formatMessageDate(messageDate),
          id: `date-${dateStr}`
        });
      }
      
      groupedMessages.push({
        type: 'message',
        value: msg,
        id: msg._id
      });
    });
    
    return groupedMessages;
  };
  
  // Format date for date separators
  const formatMessageDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  const groupedMessages = groupMessagesByDate();
  
  return (
    <div 
      ref={containerRef}
      className="messages-container px-2 py-4 flex-1 overflow-y-auto overscroll-contain h-full min-h-0"
    >
      {(!messages || messages.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full text-center text-white/70"
        >
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-1">No messages yet</p>
          <p className="text-sm max-w-xs">Start your conversation with {selectedUser?.fullName}</p>
        </motion.div>
      )}
      
      {groupedMessages.map((item) => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="flex justify-center my-3">
                <div className="glass-dark px-4 py-1 rounded-full text-xs font-medium text-white shadow-sm">
                  {item.value}
                </div>
              </div>
            );
          } else {
            return (
              <div key={item.id} className="animate-fade-in">
                <Message message={item.value} />
              </div>
            );
          }
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Messages;