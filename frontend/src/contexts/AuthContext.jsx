import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          setAuthUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await apiService.login(credentials);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setAuthUser(data);
      localStorage.setItem('authUser', JSON.stringify(data));
      
      toast.success('Login successful!');
      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await apiService.register(userData);

      if (data.success) {
        // Auto-login: Store token and user data
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        setAuthUser(data);
        localStorage.setItem('authUser', JSON.stringify(data));

        toast.success(data.message || 'Registration successful!');
        return { success: true, data };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Something went wrong!';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const data = await apiService.logout();
      
      setAuthUser(null);
      localStorage.removeItem('authUser');
      localStorage.removeItem('token');
      
      toast.success(data.message || 'Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error(error.response?.data?.message || 'Logout failed!');
      return { success: false };
    }
  };

  // Update user function
  const updateUser = (updatedData) => {
    const newUserData = { ...authUser, ...updatedData };
    setAuthUser(newUserData);
    localStorage.setItem('authUser', JSON.stringify(newUserData));
  };

  const value = {
    authUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    setAuthUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
