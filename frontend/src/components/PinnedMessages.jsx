import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

const PinnedMessages = ({ chatId, isGroup, onClose, onMessageClick }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinnedMessages();
  }, [chatId]);

  const fetchPinnedMessages = async () => {
    try {
      const response = await apiService.client.get(
        `/api/v1/message/pinned/${chatId}?isGroup=${isGroup}`
      );
      setPinnedMessages(response.data.pinnedMessages);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId) => {
    try {
      await apiService.client.delete(`/api/v1/message/${messageId}/pin`);
      setPinnedMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success('Message unpinned successfully');
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast.error('Failed to unpin message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Pinned Messages</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-center dark:text-gray-400">Loading...</p>
        ) : pinnedMessages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No pinned messages</p>
        ) : (
          <div className="space-y-3">
            {pinnedMessages.map(msg => (
              <div
                key={msg._id}
                className="p-3 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onMessageClick(msg._id);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <img
                      src={msg.senderId.profilePhoto}
                      alt={msg.senderId.fullName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="font-medium dark:text-white">
                      {msg.senderId.fullName}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnpin(msg._id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Unpin
                  </button>
                </div>
                <p className="text-sm dark:text-gray-300">{msg.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.pinnedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinnedMessages;
