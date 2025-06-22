import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';
import { toast } from 'react-toastify';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.accessToken = null;
    this.isInitialized = false;
  }

  // Initialize auth state from localStorage
  init() {
    // Prevent multiple initializations
    if (this.isInitialized) {
      return;
    }
    
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (accessToken && user) {
      try {
        this.accessToken = accessToken;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        
        console.log('🔓 AuthService initialized with stored auth data:', {
          hasToken: !!accessToken,
          userEmail: this.user?.email,
          userRole: this.user?.role
        });
        
        // Verify token silently - don't logout on failure
        this.verifyToken().catch((error) => {
          console.warn('🔐 Token verification failed during init:', error.message);
        });
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Don't logout, just clear the invalid data
        this.clearAuthData();
      }
    } else {
      console.log('🔒 No stored auth data found');
    }
    
    this.isInitialized = true;
  }

  // Clear auth data without calling logout endpoint
  clearAuthData() {
    this.isAuthenticated = false;
    this.user = null;
    this.accessToken = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('parent_id');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('adminId');
  }

  // Login with email and password
  async login(email, password, role = 'parent') {
    try {
      console.log('🔐 Attempting login:', { email, role });

      // Choose the correct endpoint based on role
      let endpoint;
      switch (role) {
        case 'teacher':
          endpoint = API_CONFIG.ENDPOINTS.TEACHER_LOGIN;
          break;
        case 'admin':
          endpoint = API_CONFIG.ENDPOINTS.ADMIN_LOGIN;
          break;
        case 'parent':
        default:
          endpoint = API_CONFIG.ENDPOINTS.LOGIN;
          break;
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
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Handle successful login
  handleLoginSuccess(data) {
    const { accessToken, user, refreshToken } = data;
    
    // Store auth data
    this.accessToken = accessToken;
    this.user = user;
    this.isAuthenticated = true;

    // Save to localStorage
    localStorage.setItem('accessToken', accessToken);
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
    toast.success(`Welcome back, ${user.name || user.email}!`);

    return { accessToken, user, role: user.role };
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
      if (this.isAuthenticated && this.accessToken) {
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
      if (!this.accessToken) {
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

      this.accessToken = accessToken;
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
      isAuthenticated: this.isAuthenticated,
      user: this.user,
      accessToken: this.accessToken,
      role: this.user?.role || 'none'
    };
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isLoggedIn() {
    // Check local state first
    if (this.isAuthenticated && this.accessToken && this.user) {
      return true;
    }
    
    // Fallback to localStorage check (for initialization scenarios)
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    if (accessToken && user) {
      try {
        const parsedUser = JSON.parse(user);
        // Update local state if we have valid stored data but local state is not set
        if (!this.isAuthenticated) {
          this.accessToken = accessToken;
          this.user = parsedUser;
          this.isAuthenticated = true;
          console.log('🔄 AuthService: Restored auth state from localStorage');
        }
        return true;
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        return false;
      }
    }
    
    return false;
  }

  // Get user role
  getUserRole() {
    return this.user?.role || localStorage.getItem('role');
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Get auth accessToken
  getToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, userData);
      
      // Update local user data
      this.user = { ...this.user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(this.user));
      
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
}

// Create singleton instance
const authService = new AuthService();

// Initialize on module load
authService.init();

export default authService;

