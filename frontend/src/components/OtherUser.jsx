import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { getImageUrl } from '../utils/imageUtils';
import { formatLastSeen } from '../utils/dateUtils';

const OtherUser = ({ user }) => {
  const { selectedUser, setSelectedUser, setSelectedGroup, onlineUsers } = useUser();
  const { getUnreadCount } = useChat();

  const isOnline = onlineUsers?.includes(user._id) ?? false;
  const isSelected = selectedUser?._id === user?._id;
  const unreadCount = getUnreadCount(user._id);

  const selectedUserHandler = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null); // Clear selected group when selecting a user
  };

  return (
    <div
      onClick={() => selectedUserHandler(user)}
      className={`mb-2 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-400 shadow-md'
          : 'hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <img
            src={getImageUrl(user?.profilePhoto)}
            alt={`${user?.fullName}'s profile`}
            className={`rounded-full ring ${
              isSelected ? 'ring-white' : 'ring-blue-400/30'
            } ring-offset-base-100 ring-offset-1 w-full h-full object-cover`}
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex justify-between items-center'>
            <h3 className={`font-medium truncate ${
              isSelected ? 'text-white' : 'text-gray-200'
            }`}>
              {user?.fullName}
            </h3>
          </div>

          <div className="flex justify-between items-center mt-1">
            <p className="text-xs truncate text-gray-400">
              {isOnline ? 'Online' : formatLastSeen(user?.lastSeen)}
            </p>
            {unreadCount > 0 && !isSelected && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherUser;