import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageReactions = ({ message, onReact, currentUserId }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji) => {
    onReact(message._id, emoji);
    setShowPicker(false);
  };

  const handleRemoveReaction = () => {
    onReact(message._id, null);
  };

  // Get current user's reaction
  const userReaction = message.reactions?.find(r => r.userId === currentUserId);

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {}) || {};

  return (
    <div className="relative">
      {/* Reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-gray-400 hover:text-white transition-colors p-1"
        title="React to message"
      >
        {userReaction ? (
          <span className="text-lg">{userReaction.emoji}</span>
        ) : (
          <span className="text-sm">😊</span>
        )}
      </button>

      {/* Emoji picker */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg p-2 flex gap-1 z-10"
            >
              {COMMON_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
              {userReaction && (
                <button
                  onClick={handleRemoveReaction}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                  title="Remove reaction"
                >
                  ✕
                </button>
              )}
            </motion.div>
            <div 
              className="fixed inset-0 z-0" 
              onClick={() => setShowPicker(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Display reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(groupedReactions).map(([emoji, reactions]) => (
            <motion.div
              key={emoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gray-700/50 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs"
            >
              <span>{emoji}</span>
              <span className="text-gray-300">{reactions.length}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
