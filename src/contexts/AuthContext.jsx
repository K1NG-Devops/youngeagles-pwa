import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define isAuthenticated function early
  const isAuthenticated = !!token && !!user;

  // Define refreshUserProfile function before useEffect hooks
  const refreshUserProfile = async () => {
    try {
      console.log('🔄 Refreshing user profile from server...');
      
      // Use the auth/profile endpoint directly instead of users/profile
      const response = await apiService.get('/api/auth/profile');
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        console.log('✅ User profile refreshed successfully');
        
        // Update user state with fresh data
        setUser(userData);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
        
        return userData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      
      // If profile refresh fails, don't clear auth - user might be offline
      // Just log the error and continue with cached data
      console.log('⚠️ Using cached user data due to profile refresh failure');
      
      throw error;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          apiService.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-sync profile periodically when user is active
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Initial sync after login
    setTimeout(() => {
      refreshUserProfile();
    }, 1000);

    // Periodic sync every 5 minutes when tab is active
    const syncInterval = setInterval(() => {
      if (!document.hidden) {
        refreshUserProfile();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Sync when tab becomes visible (user switches back to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(() => {
          refreshUserProfile();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user?.id]);

  // Listen for storage changes (when user updates profile on another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          if (updatedUser.id === user?.id) {
            setUser(updatedUser);
            console.log('🔄 Profile updated from another tab');
          }
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  const login = async (credentials, userType = 'parent') => {
    try {
      setLoading(true);
      
      let endpoint = '/api/auth/parent-login';
      if (userType === 'teacher') {
        endpoint = '/api/auth/teacher-login';
      } else if (userType === 'admin') {
        endpoint = '/api/auth/admin-login';
      }

      const response = await apiService.post(endpoint, credentials);
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Save to state
        setToken(newToken);
        setUser(userData);
        
        // Save to localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set auth header for future requests
        apiService.setAuthToken(newToken);
        
        nativeNotificationService.success(`Welcome back, ${userData.name}!`);
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      nativeNotificationService.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Determine the registration endpoint based on user role
      let endpoint = '/api/auth/register';
      if (userData.role === 'parent') {
        endpoint = '/api/auth/parent-register';
      } else if (userData.role === 'teacher') {
        endpoint = '/api/auth/teacher-register';
      } else if (userData.role === 'admin') {
        endpoint = '/api/auth/admin-register';
      }

      const response = await apiService.post(endpoint, userData);
      
      if (response.data.success) {
        nativeNotificationService.success('Account created successfully! Please sign in to continue.');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      nativeNotificationService.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    apiService.setAuthToken(null);
    nativeNotificationService.info('Logged out successfully');
  };

  const updateUser = (updates) => {
    if (!user) return;
    
    // Ensure profile picture consistency across all possible field names
    const normalizedUpdates = { ...updates };
    
    // If any profile picture field is updated, sync all variants
    const profilePicFields = ['profilePicture', 'profile_picture', 'avatar', 'image'];
    const profilePicValue = profilePicFields.find(field => updates[field]);
    
    if (profilePicValue) {
      const imageUrl = updates[profilePicValue];
      profilePicFields.forEach(field => {
        normalizedUpdates[field] = imageUrl;
      });
    }
    
    // Add timestamp for cache busting
    normalizedUpdates.updated_at = new Date().toISOString();
    
    const updatedUser = { ...user, ...normalizedUpdates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Force a re-render of profile images across the app
    window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
      detail: { user: updatedUser, imageUrl: profilePicValue ? normalizedUpdates[profilePicValue] : null }
    }));
    
    console.log('✅ User updated with profile picture sync:', {
      original: updates,
      normalized: normalizedUpdates,
      imageUrl: profilePicValue ? normalizedUpdates[profilePicValue] : null
    });
  };
  
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUserProfile,
    isAuthenticated: isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 