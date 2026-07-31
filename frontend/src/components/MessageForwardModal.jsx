import { useState } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import { getImageUrl } from '../utils/imageUtils';

const MessageForwardModal = ({ isOpen, onClose, message, users, groups }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleForward = async () => {
    if (selectedUsers.length === 0 && selectedGroups.length === 0) return;

    setLoading(true);
    try {
      await apiService.client.post(`/api/v1/message/${message._id}/forward`, {
        recipientIds: selectedUsers,
        groupIds: selectedGroups
      });

      toast.success('Message forwarded successfully!');
      setSelectedUsers([]);
      setSelectedGroups([]);
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error('Failed to forward message');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Forward Message</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2 dark:text-white">Select Users</h3>
          <div className="max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600">
            {users?.map(user => (
              <div
                key={user._id}
                className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                onClick={() => handleUserToggle(user._id)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => {}}
                  className="mr-3"
                />
                <img
                  src={getImageUrl(user.profilePhoto)}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="dark:text-white">{user.fullName}</span>
              </div>
            ))}
          </div>
        </div>

        {groups && groups.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 dark:text-white">Select Groups</h3>
            <div className="max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600">
              {groups.map(group => (
                <div
                  key={group._id}
                  className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleGroupToggle(group._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group._id)}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div className="w-8 h-8 rounded-full mr-2 bg-blue-500 flex items-center justify-center text-white">
                    {group.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="dark:text-white">{group.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || (selectedUsers.length === 0 && selectedGroups.length === 0)}
          >
            {loading ? 'Forwarding...' : 'Forward'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageForwardModal;
