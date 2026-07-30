import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { motion } from 'framer-motion';
import { getImageUrl, isImageFile } from '../utils/imageUtils';
import { formatMessageTime } from '../utils/dateUtils';
import { BsCheck, BsCheckAll, BsTrash, BsPencil, BsPin, BsReply, BsForward } from 'react-icons/bs';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import MessageReactions from './MessageReactions';
import MessageEditModal from './MessageEditModal';
import MessageForwardModal from './MessageForwardModal';
import apiService from '../services/apiService';

const Message = ({ message, onReply }) => {
  const scroll = useRef();
  const { authUser } = useAuth();
  const { selectedUser, otherUsers, groups } = useUser();
  const { deleteMessage, addReaction, editMessage, updateMessagePinned } = useChat();
  const isOnline = useOnlineStatus();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const senderIdStr = typeof message?.senderId === 'object' ? message.senderId._id : message?.senderId;
  const isOwnMessage = senderIdStr === authUser?._id;

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  const handleDeleteForMe = async () => {
    await deleteMessage(message._id, false);
    setShowMenu(false);
  };

  const handleDeleteForEveryone = async () => {
    await deleteMessage(message._id, true);
    setShowMenu(false);
  };

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleForward = () => {
    setShowMenu(false);
    setShowForwardModal(true);
  };

  const handleReply = () => {
    setShowMenu(false);
    if (onReply) {
      onReply(message);
    }
  };

  const handlePin = async () => {
    setShowMenu(false);
    try {
      if (message.isPinned) {
        await apiService.unpinMessage(message._id);
        updateMessagePinned(message._id, false);
      } else {
        await apiService.pinMessage(message._id);
        updateMessagePinned(message._id, true);
      }
    } catch (error) {
      console.error('Failed to pin/unpin message:', error);
    }
  };

  const handleSaveEdit = async (messageId, newText) => {
    await editMessage(messageId, newText);
  };

  const handleReact = async (messageId, emoji) => {
    await addReaction(messageId, emoji);
  };

  // Check if message was deleted
  if (message?.deletedForEveryone) {
    return (
      <motion.div
        ref={scroll}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'} mb-4 px-2`}
      >
        <div className="chat-bubble bg-gray-500/30 text-gray-400 italic text-sm">
          <BsTrash className="inline mr-1" />
          This message was deleted
        </div>
      </motion.div>
    );
  }

  // Render delivery status icon
  const renderStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message?.status === 'read' || message?.read) {
      return <BsCheckAll className="text-blue-400" />;
    } else if (message?.status === 'delivered' || message?.delivered) {
      return <BsCheckAll className="text-gray-400" />;
    } else {
      return <BsCheck className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      ref={scroll}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'} mb-4 px-2 relative group overflow-visible`}
    >
      <div className="chat-image avatar">
        <div className="w-8 h-8 rounded-full ring-1 ring-white/30">
          <img
            alt="User avatar"
            src={getImageUrl(isOwnMessage ? authUser?.profilePhoto : (message?.senderId?.profilePhoto || selectedUser?.profilePhoto))}
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <span className="text-xs opacity-70 text-white font-semibold">
          {isOwnMessage ? 'You' : (message?.senderId?.fullName || selectedUser?.fullName)}
        </span>
        <time className="text-xs opacity-50 ml-2 text-gray-300">
          {formatMessageTime(message?.createdAt || message?.timestamp)}
        </time>
        {message?.edited && (
          <span className="text-xs opacity-50 ml-2 text-gray-400 italic">(edited)</span>
        )}
      </div>
      
      {/* Message bubble with context menu */}
      <div className="relative">
        <div 
          className={`chat-bubble ${
            isOwnMessage
              ? 'bg-blue-900 text-white'
              : 'bg-white/20 backdrop-blur-sm text-white'
          } shadow-md px-4 py-2 text-base w-fit max-w-full`}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
        >
          <div className="space-y-2">
            {/* Replied Message Snippet */}
            {message?.replyTo && (
              <div className="bg-black/20 p-2 rounded border-l-4 border-blue-400 text-sm mb-1 opacity-80">
                <span className="font-semibold block text-blue-300 text-xs">
                  Replying to message
                </span>
                <span className="truncate block max-w-[200px]">
                  {message.replyTo.message || 'Attachment'}
                </span>
              </div>
            )}
            
            {/* Text Message */}
            {message?.message && (
              <p>{message.message}</p>
            )}
            {/* File Attachments */}
            {message?.files?.length > 0 && message.files.map((file, index) => {
              const fileUrl = file;
              const originalFileName = file.split('/').pop();

              return (
                <div key={index}>
                  {isImageFile(file) ? (
                    <img
                      src={fileUrl}
                      alt={originalFileName}
                      className="max-w-[200px] rounded-lg border border-white/20"
                    />
                  ) : (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-200 underline break-all"
                    >
                      📄 {originalFileName}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Context menu */}
        {showMenu && isOnline && (
          <div className={`absolute top-full ${isOwnMessage ? 'right-0' : 'left-0'} mt-1 bg-gray-800 rounded-lg shadow-lg py-1 z-50 min-w-[150px]`}>
            <button
              onClick={handleReply}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <BsReply /> Reply
            </button>
            <button
              onClick={handleForward}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <BsForward /> Forward
            </button>
            {isOwnMessage && message?.message && (
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <BsPencil /> Edit
              </button>
            )}
            <button
              onClick={handleDeleteForMe}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <BsTrash /> Delete for me
            </button>
            {isOwnMessage && (
              <button
                onClick={handleDeleteForEveryone}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
              >
                <BsTrash /> Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="chat-footer opacity-50 text-xs flex gap-2 mt-1 items-center">
        {renderStatusIcon()}
        <MessageReactions 
          message={message} 
          onReact={handleReact}
          currentUserId={authUser?._id}
        />
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {showEditModal && (
          <MessageEditModal
            message={message}
            onSave={handleSaveEdit}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Forward modal */}
      <AnimatePresence>
        {showForwardModal && (
          <MessageForwardModal
            isOpen={showForwardModal}
            onClose={() => setShowForwardModal(false)}
            message={message}
            users={otherUsers}
            groups={groups}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Message;
