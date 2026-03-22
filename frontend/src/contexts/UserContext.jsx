import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [otherUsers, setOtherUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Fetch all users except the authenticated user
  const fetchOtherUsers = useCallback(async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setOtherUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setOtherUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Fetch user groups
  const fetchGroups = useCallback(async () => {
    if (!authUser) return;

    setGroupsLoading(true);
    try {
      const data = await apiService.getUserGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, [authUser]);

  // Auto-fetch users and groups when auth user is available
  useEffect(() => {
    if (authUser) {
      fetchOtherUsers();
      fetchGroups();
    } else {
      setOtherUsers([]);
      setSelectedUser(null);
      setGroups([]);
      setSelectedGroup(null);
    }
  }, [authUser, fetchOtherUsers, fetchGroups]);

  // Check if a user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Search users by name or username
  const searchUsers = useCallback((query) => {
    if (!query.trim()) return otherUsers;
    
    const lowerQuery = query.toLowerCase();
    return otherUsers.filter(user =>
      user.fullName?.toLowerCase().includes(lowerQuery) ||
      user.username?.toLowerCase().includes(lowerQuery)
    );
  }, [otherUsers]);

  const value = {
    otherUsers,
    setOtherUsers,
    selectedUser,
    setSelectedUser,
    onlineUsers,
    setOnlineUsers,
    loading,
    fetchOtherUsers,
    isUserOnline,
    searchUsers,
    groups,
    setGroups,
    selectedGroup,
    setSelectedGroup,
    groupsLoading,
    fetchGroups
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
