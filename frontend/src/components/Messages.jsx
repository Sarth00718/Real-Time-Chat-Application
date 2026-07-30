import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Message from './Message.jsx';
import MessageSkeleton from './MessageSkeleton.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import MessageSearch from './MessageSearch.jsx';
import { useChat } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { motion } from 'framer-motion';
import { groupMessagesByDate } from '../utils/dateUtils';
import { BiSearch } from 'react-icons/bi';

function Messages({ onReply }) {
  const { messages, loading } = useChat();
  const { selectedUser } = useUser();
  const { isUserTyping } = useTypingIndicator();
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const messageRefs = useRef({});
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupedMessages = groupMessagesByDate(messages);

  // Scroll to specific message
  const scrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      element.classList.add('highlight-message');
      setTimeout(() => {
        element.classList.remove('highlight-message');
      }, 2000);
    }
  };

  // Handle reply to message
  const handleReply = (message) => {
    if (onReply) {
      onReply(message);
    }
  };
  
  // Show loading skeleton
  if (loading) {
    return <MessageSkeleton />;
  }
  
  return (
    <div className="relative flex-1 overflow-hidden h-full min-h-0 flex flex-col">
      {/* Search bar */}
      <div className="flex items-center justify-end p-2 border-b border-white/10">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          title="Search messages"
        >
          <BiSearch className="w-5 h-5" />
        </button>
      </div>

      {/* Message search */}
      <AnimatePresence>
        {showSearch && (
          <MessageSearch
            messages={messages}
            onResultClick={scrollToMessage}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>

      {/* Messages container */}
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
              <div 
                key={item.id} 
                ref={el => messageRefs.current[item.value._id] = el}
                className="animate-fade-in"
              >
                <Message message={item.value} onReply={handleReply} />
              </div>
            );
          }
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isUserTyping && (
            <TypingIndicator userName={selectedUser?.fullName} />
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default Messages;