import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';
import { toast } from 'react-toastify';
import axios from 'axios';

class AuthService {
  constructor() {
    // Private state
    this._state = {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isInitialized: false
    };
    this.subscribers = [];

    // Initialize immediately
    this.init();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    // Return an unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    console.log(`📢 Notifying ${this.subscribers.length} subscribers of auth state change.`);
    for (const callback of this.subscribers) {
      callback(this._state);
    }
  }

  // Initialize auth state from localStorage
  init() {
    // Prevent multiple initializations
    if (this._state.isInitialized) {
      console.log('🔄 AuthService already initialized');
      return;
    }
    
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    console.log('🚀 AuthService.init() called');
    
    if (accessToken && user) {
      try {
        const parsedUser = JSON.parse(user);
        this._state = {
          accessToken,
          user: parsedUser,
          isAuthenticated: true,
          isInitialized: true
        };
        
        console.log('🔓 AuthService initialized with stored auth data:', {
          hasToken: true,
          userEmail: parsedUser?.email,
          userRole: parsedUser?.role
        });
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        this.clearAuthData();
      }
    } else {
      console.log('🔒 No stored auth data found during init');
      this._state.isInitialized = true;
    }
    this.notifySubscribers();
  }

  // Clear auth data without calling logout endpoint
  clearAuthData() {
    this._state = {
      isAuthenticated: false,
      user: null,
      accessToken: null,
      isInitialized: true
    };

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('parent_id');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('adminId');
    this.notifySubscribers();
  }

  // Login with email and password
  async login(email, password, role = 'parent') {
    try {
      console.log('🔐 Attempting login:', { email, role });

      // Route to appropriate endpoint based on role
      let endpoint;
      switch (role) {
        case 'admin':
          endpoint = API_CONFIG.ENDPOINTS.ADMIN_LOGIN;
          break;
        case 'teacher':
          endpoint = API_CONFIG.ENDPOINTS.TEACHER_LOGIN;
          break;
        default:
          endpoint = API_CONFIG.ENDPOINTS.LOGIN;
      }

      console.log('🌐 Using endpoint:', endpoint);

      // Always use live API - no mock data fallback
      const response = await api.post(endpoint, {
        email,
        password,
        role
      });

      return this.handleLoginSuccess(response.data);
    } catch (error) {
      console.error('🚨 Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Handle successful login
  handleLoginSuccess(data) {
    const { accessToken, token, user, refreshToken } = data;
    
    // Handle both accessToken and token field names
    const finalToken = accessToken || token;
    
    if (!finalToken) {
      throw new Error('No access token received from server');
    }

    // Clear any existing auth data before setting new data
    this.clearAuthData();
    
    // Update state with new auth data
    this._state = {
      accessToken: finalToken,
      user,
      isAuthenticated: true,
      isInitialized: true
    };

    // Save to localStorage
    localStorage.setItem('accessToken', finalToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', user.role);
    
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Set role-specific localStorage items
    if (user.role === 'parent') {
      localStorage.setItem('parent_id', user.id);
    } else if (user.role === 'teacher') {
      localStorage.setItem('teacherId', user.id);
    } else if (user.role === 'admin') {
      localStorage.setItem('adminId', user.id);
    }

    console.log('✅ Login successful:', user.email, user.role);
    console.log('🔑 Auth token set:', finalToken.substring(0, 20) + '...');
    toast.success(`Welcome back, ${user.name || user.email}!`);

    this.notifySubscribers();
    return { accessToken: finalToken, user, role: user.role };
  }


  // Register new user
  async register(userData) {
    try {
      console.log('📝 Attempting registration:', userData.email);

      const response = await api.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      
      toast.success('Registration successful! Please log in.');
      return response.data;
    } catch (error) {
      console.error('🚨 Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Logout user
  async logout(silent = false) {
    try {
      // Only call logout endpoint if we have valid auth
      if (this._state.isAuthenticated && this._state.accessToken) {
        await api.post(API_CONFIG.ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      if (!silent) {
      console.warn('Logout API call failed:', error.message);
      }
    } finally {
      this.clearAuthData();
      if (!silent) {
      console.log('👋 User logged out');
      toast.info('You have been logged out.');
      }
    }
  }

  // Verify token validity
  async verifyToken() {
    try {
      if (!this._state.accessToken) {
        throw new Error('No accessToken available');
      }

      const response = await api.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN);
      return response.data;
    } catch (error) {
      console.warn('🔐 Token verification failed:', error.message);
      
      // Try to refresh token if verification fails
      try {
        await this.refreshToken();
        // If refresh successful, retry verification
        const retryResponse = await api.get(API_CONFIG.ENDPOINTS.VERIFY_TOKEN);
        return retryResponse.data;
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
      throw error;
      }
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      this._state.accessToken = accessToken;
      console.log('🔄 Token refreshed successfully');
      
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      // Clear auth data on refresh failure
      this.logout();
      throw error;
    }
  }

  // Check if token needs refresh
  async checkAndRefreshToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      // Try to verify current token
      try {
        await this.verifyToken();
        return true;
      } catch (error) {
        // If verification fails, try to refresh
        await this.refreshToken();
        return true;
      }
    } catch (error) {
      console.error('Token check and refresh failed:', error);
      return false;
    }
  }

  // Get current auth state
  getAuthState() {
    return {
      isAuthenticated: this._state.isAuthenticated,
      user: this._state.user,
      accessToken: this._state.accessToken,
      role: this._state.user?.role || 'none'
    };
  }

  // Get current user
  getCurrentUser() {
    return this._state.user;
  }

  // Check if user is authenticated
  isLoggedIn() {
    return this._state.isAuthenticated && !!this._state.accessToken && !!this._state.user;
  }

  // Get user role
  getUserRole() {
    return this._state.user?.role;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Get auth token
  getToken() {
    return this._state.accessToken;
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, userData);
      
      // Update local user data
      this._state.user = { ...this._state.user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(this._state.user));
      
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      console.error('🚨 Profile update failed:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Change user password
  async changePassword(passwordData) {
    try {
      console.log('🔐 Attempting password change...');
      
      const response = await api.post('/api/auth/change-password', passwordData);
      
      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('🚨 Password change failed:', error);
      const errorMessage = error.response?.data?.message || 'Password change failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  // Teacher Login
  async teacherLogin(credentials) {
    try {
      console.log('🔑 Attempting teacher login for:', credentials.email);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      
      return this.handleLoginSuccess(response.data);
    } catch (error) {
      console.error('🚨 Teacher login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Teacher login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Admin Login
  async adminLogin(credentials) {
    try {
      console.log('🔑 Attempting admin login for:', credentials.email);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      
      return this.handleLoginSuccess(response.data);
    } catch (error) {
      console.error('🚨 Admin login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}

// Create singleton instance, attaching to window to prevent HMR issues
const AUTH_SERVICE_INSTANCE_KEY = '__authServiceInstance';

if (!window[AUTH_SERVICE_INSTANCE_KEY]) {
  console.log('✨ Creating new AuthService singleton instance.');
  window[AUTH_SERVICE_INSTANCE_KEY] = new AuthService();
} else {
  console.log('♻️ Re-using existing AuthService singleton instance from window.');
}

const authService = window[AUTH_SERVICE_INSTANCE_KEY];

export default authService;

