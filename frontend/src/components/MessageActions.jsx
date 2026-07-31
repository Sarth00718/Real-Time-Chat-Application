import { useState } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

const MessageActions = ({ message, onReply, onForward, isGroupAdmin, currentUserId }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handlePin = async () => {
    try {
      await apiService.client.post(`/api/v1/message/${message._id}/pin`);
      toast.success('Message pinned successfully');
      setShowMenu(false);
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error(error.response?.data?.error || 'Failed to pin message');
    }
  };

  const handleUnpin = async () => {
    try {
      await apiService.client.delete(`/api/v1/message/${message._id}/pin`);
      toast.success('Message unpinned successfully');
      setShowMenu(false);
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast.error('Failed to unpin message');
    }
  };

  const isSender = message.senderId._id === currentUserId;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-white/20 rounded transition-colors"
      >
        ⋮
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-10">
          <button
            onClick={() => {
              onReply(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-white/20 flex items-center gap-2 transition-colors"
          >
            <span>↩️</span> Reply
          </button>

          <button
            onClick={() => {
              onForward(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-white/20 flex items-center gap-2 transition-colors"
          >
            <span>➡️</span> Forward
          </button>

        </div>
      )}
    </div>
  );
};

export default MessageActions;
