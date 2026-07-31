import { useState } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated, users }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    setLoading(true);
    try {
      const response = await apiService.createGroup({
        name: groupName,
        description,
        memberIds: selectedMembers
      });

      onGroupCreated(response.group);
      setGroupName('');
      setDescription('');
      setSelectedMembers([]);
      toast.success('Group created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Create New Group</h2>
        
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white"
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white"
              placeholder="Enter group description"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Select Members * (at least 1)
            </label>
            <div className="max-h-48 overflow-y-auto border rounded-lg dark:border-gray-600">
              {users?.filter(u => u._id !== authUser?._id).map(user => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleMemberToggle(user._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading || !groupName.trim() || selectedMembers.length === 0}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
