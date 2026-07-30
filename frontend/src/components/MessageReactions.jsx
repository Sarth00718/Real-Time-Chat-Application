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
    <div className="relative inline-flex items-center">
      {/* Reaction trigger */}
      <button
        type="button"
        onClick={() => setShowPicker(prev => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-gray-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
        title="React to message"
        aria-expanded={showPicker}
      >
        {userReaction ? (
          <span className="text-lg">{userReaction.emoji}</span>
        ) : (
          <span className="text-lg">😊</span>
        )}
      </button>

      {/* Emoji picker */}
      <AnimatePresence>
        {showPicker && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full right-0 mb-2 min-w-[220px] rounded-2xl bg-slate-950/95 p-2 shadow-2xl ring-1 ring-white/10 z-50 overflow-visible"
            >
              <div className="flex flex-wrap gap-2 p-1">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReact(emoji)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-2xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {userReaction && (
                <div className="border-t border-white/10 pt-2 mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleRemoveReaction}
                    className="text-sm text-rose-300 hover:text-rose-200 transition"
                    title="Remove reaction"
                  >
                    Remove reaction
                  </button>
                </div>
              )}
            </motion.div>
            <button
              type="button"
              className="fixed inset-0 z-0 bg-transparent"
              onClick={() => setShowPicker(false)}
              aria-hidden="true"
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
              className="bg-slate-900/80 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-white"
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
