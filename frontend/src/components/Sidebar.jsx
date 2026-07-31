import { useState, useMemo, useRef, useCallback } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import { FiLogOut } from 'react-icons/fi';
import { MdClear, MdGroupAdd } from 'react-icons/md';
import { HiUsers, HiUserGroup } from 'react-icons/hi';
import OtherUsers from './OtherUsers.jsx';
import UserSkeleton from './UserSkeleton.jsx';
import ProfilePhotoUpload from './ProfilePhotoUpload.jsx';
import ProfileEditor from './ProfileEditor.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { getImageUrl } from '../utils/imageUtils';

const Sidebar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'
  
  const { authUser, logout } = useAuth();
  const { otherUsers, setSelectedUser, loading, groups, setSelectedGroup, groupsLoading, fetchGroups } = useUser();
  const { clearMessages } = useChat();

  // Use ref to store users to prevent circular dependency
  const usersRef = useRef(otherUsers);
  usersRef.current = otherUsers;

  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  // Memoized search function to prevent recreation
  const searchUsersLocal = useCallback((query) => {
    if (!query.trim()) return usersRef.current;
    
    const lowerQuery = query.toLowerCase();
    return usersRef.current.filter(user =>
      user.fullName?.toLowerCase().includes(lowerQuery) ||
      user.username?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  const searchGroupsLocal = useCallback((query) => {
    if (!query.trim()) return groupsRef.current || [];
    
    const lowerQuery = query.toLowerCase();
    return (groupsRef.current || []).filter(group =>
      group.name?.toLowerCase().includes(lowerQuery) ||
      group.description?.toLowerCase().includes(lowerQuery)
    );
  }, []);

  // Filter users based on search - only depends on search term
  const filteredUsers = useMemo(() => {
    return searchUsersLocal(search);
  }, [search, searchUsersLocal, otherUsers]); // otherUsers as dependency to trigger re-filter

  const filteredGroups = useMemo(() => {
    return searchGroupsLocal(search);
  }, [search, searchGroupsLocal, groups]);

  const logoutHandler = async () => {
    const result = await logout();
    if (result.success) {
      clearMessages();
      setSelectedUser(null);
      navigate('/login');
    }
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearch('');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleGroupCreated = (newGroup) => {
    fetchGroups();
    setActiveTab('groups');
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null); // Clear selected user when selecting a group
  };

  return (
    <div className='h-full bg-blue-400/40 backdrop-blur-md flex flex-col p-4'>
      {/* User profile section */}
      <button
        onClick={() => setShowProfileEditor(true)}
        className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition w-full"
      >
        <div className="avatar online">
          <div className="w-12 h-12 rounded-full">
            <img 
              src={getImageUrl(authUser?.profilePhoto)} 
              alt="Your profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-white truncate">{authUser?.fullName}</h3>
          <p className="text-xs text-gray-400 truncate">{authUser?.username}</p>
        </div>
      </button>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor onClose={() => setShowProfileEditor(false)} />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
          users={otherUsers}
        />
      )}
      
      {/* Tabs for Users and Groups */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition ${
            activeTab === 'users'
              ? 'bg-blue-900 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <HiUsers className="w-5 h-5" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition ${
            activeTab === 'groups'
              ? 'bg-blue-900 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <HiUserGroup className="w-5 h-5" />
          <span>Groups</span>
        </button>
      </div>
      
      {/* Search section */}
      <div className='flex items-center gap-2 mb-4'>
        <div className="relative flex-1">
          <input
            value={search}
            onChange={handleSearchChange}
            className='input input-bordered bg-white/20 text-white placeholder-white/70 w-full pr-10 focus:ring-2 focus:ring-blue-400 focus:border-transparent'
            type="search"
            placeholder={activeTab === 'users' ? 'Search users...' : 'Search groups...'}
            aria-label={activeTab === 'users' ? 'Search users' : 'Search groups'}
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <MdClear className='w-5 h-5' />
            </button>
          )}
        </div>
        {activeTab === 'groups' && (
          <button
            type="button"
            onClick={() => setShowCreateGroup(true)}
            className='btn bg-blue-900 hover:bg-blue-700 border-none text-white'
            title="Create Group"
          >
            <MdGroupAdd className='w-5 h-5' />
          </button>
        )}
      </div>

      {/* Search results indicator */}
      {search && !loading && !groupsLoading && (
        <div className="text-sm text-gray-300 mb-2">
          {activeTab === 'users' ? (
            filteredUsers?.length === 0 ? (
              <span className="text-red-300">No users found for "{search}"</span>
            ) : (
              <span>
                {filteredUsers?.length} user{filteredUsers?.length !== 1 ? 's' : ''} found
              </span>
            )
          ) : (
            filteredGroups?.length === 0 ? (
              <span className="text-red-300">No groups found for "{search}"</span>
            ) : (
              <span>
                {filteredGroups?.length} group{filteredGroups?.length !== 1 ? 's' : ''} found
              </span>
            )
          )}
        </div>
      )}

      <div className="divider before:bg-white/30 after:bg-white/30 text-white/70">
        {search ? 'Search Results' : activeTab === 'users' ? 'Contacts' : 'Groups'}
      </div>

      {/* Users/Groups list - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1 pr-1"
          style={{ 
            scrollbarWidth: 'thin', 
            msOverflowStyle: 'none'
          }}
        >
          {activeTab === 'users' ? (
            loading ? (
              <UserSkeleton />
            ) : filteredUsers?.length === 0 && search ? (
              <div className="text-center text-gray-400 py-8">
                <BiSearchAlt2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching "{search}"</p>
                <button 
                  onClick={clearSearch}
                  className="text-blue-400 hover:text-blue-300 mt-2 text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <OtherUsers users={filteredUsers} />
            )
          ) : (
            groupsLoading ? (
              <UserSkeleton />
            ) : filteredGroups?.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <HiUserGroup className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{search ? `No groups found matching "${search}"` : 'No groups yet'}</p>
                <button 
                  onClick={() => search ? clearSearch() : setShowCreateGroup(true)}
                  className="text-blue-400 hover:text-blue-300 mt-2 text-sm"
                >
                  {search ? 'Clear search' : 'Create your first group'}
                </button>
              </div>
            ) : (
              <div className='p-1 space-y-1'>
                {filteredGroups.map(group => (
                  <div
                    key={group._id}
                    onClick={() => handleGroupClick(group)}
                    className='flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition'
                  >
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {group.groupPhoto ? (
                          <img 
                            src={getImageUrl(group.groupPhoto)} 
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <HiUserGroup className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{group.name}</h3>
                      <p className="text-xs text-gray-400 truncate">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Logout button */}
      <button 
        className='btn btn-sm bg-blue-900 hover:bg-blue-600 text-white border-none mt-3 w-full flex items-center justify-center gap-2'
        onClick={logoutHandler}
      >
        <FiLogOut/> Logout
      </button>
    </div>
  );
};

export default Sidebar;