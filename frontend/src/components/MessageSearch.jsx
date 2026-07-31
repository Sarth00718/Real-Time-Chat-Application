import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch, BiX } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

const MessageSearch = ({ messages, onResultClick, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Search messages
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.message?.toLowerCase().includes(query) && !msg.deletedForEveryone
    );
  }, [messages, searchQuery]);

  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-400 text-black">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-12 left-2 right-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-30 rounded-xl overflow-hidden"
    >
      {/* Search header */}
      <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-black/20">
        <BiSearch className="text-white/70 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 bg-transparent text-white placeholder-white/70 focus:outline-none"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-white/70 hover:text-white transition-colors"
          >
            <BiX className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>

      {/* Search results */}
      {searchQuery && (
        <div className="max-h-64 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-white/70">
              No messages found for "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {searchResults.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => {
                    onResultClick(msg._id);
                    onClose();
                  }}
                  className="w-full p-3 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="text-sm text-white line-clamp-2">
                    {highlightText(msg.message, searchQuery)}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="p-2 text-xs text-white/70 text-center border-t border-white/10 bg-black/20">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MessageSearch;
