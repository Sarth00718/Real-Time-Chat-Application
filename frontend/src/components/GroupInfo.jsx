import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HiUserGroup } from 'react-icons/hi';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const GroupInfo = ({ group, onClose, onGroupUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const { authUser } = useAuth();

  const isAdmin = group.members.some(
    m => m.userId._id === authUser?._id && m.role === 'admin'
  );

  const handleUpdate = async () => {
    try {
      const response = await apiService.updateGroup(group._id, {
        name: groupName,
        description
      });
      onGroupUpdated(response.group);
      setIsEditing(false);
      toast.success('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await apiService.leaveGroup(group._id);
      toast.success('Left group successfully');
      onClose();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the group?')) return;

    try {
      const response = await apiService.removeGroupMember(group._id, memberId);
      onGroupUpdated(response.group);
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Group Info</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-2 overflow-hidden">
            {group.groupPhoto ? (
              <img
                src={getImageUrl(group.groupPhoto)}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <HiUserGroup className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white mb-2"
            />
          ) : (
            <h3 className="text-xl font-semibold dark:text-white">{group.name}</h3>
          )}
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              rows="2"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{group.description}</p>
          )}
        </div>

        {isAdmin && (
          <div className="mb-4">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Edit Group
              </button>
            )}
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-semibold mb-2 dark:text-white">
            Members ({group.members.length})
          </h4>
          <div className="space-y-2">
            {group.members.map(member => (
              <div key={member.userId._id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <div className="flex items-center">
                  <img
                    src={member.userId.profilePhoto}
                    alt={member.userId.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium dark:text-white">{member.userId.fullName}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                {isAdmin && member.userId._id !== authUser?._id && (
                  <button
                    onClick={() => handleRemoveMember(member.userId._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLeaveGroup}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupInfo;
