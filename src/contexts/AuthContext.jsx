import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Set default auth header
          apiService.setAuthToken(savedToken);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

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

  const updateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 