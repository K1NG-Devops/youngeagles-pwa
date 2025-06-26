import axios from 'axios';
import { API_CONFIG, logApiCall } from '../config/api.js';
import { toast } from 'react-toastify';

// Create axios instance with dynamic base URL based on environment
const httpClient = axios.create({
  baseURL: API_CONFIG.getApiUrl(), // Use dynamic URL from config
  timeout: API_CONFIG.TIMEOUT.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and logging
httpClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔒 Adding auth token to ${config.url}: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️ No auth token available for request to: ${config.url}`);
    }

    // Add default headers if not already set
    config.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers
    };

    // Log API calls in development
    logApiCall(config.method, config.url, config.data);

    return config;
  },
  (error) => {
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors globally
httpClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (API_CONFIG.FEATURES.DEBUG_MODE) {
      console.log('✅ API Success:', response.config.url, response.status);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401: {
          // Unauthorized - Token expired or invalid
          console.warn('🔐 Authentication failed:', originalRequest.url);
          
          // List of endpoints that should not trigger redirect even if they return 401
          const noRedirectEndpoints = [
            // '/auth/verify', // Let verification failures trigger a logout
            '/homework',
            '/parent/children',
            '/reports/parent'
          ];
          
          // Check if this is an endpoint we should ignore for redirects
          const shouldSkipRedirect = noRedirectEndpoints.some(endpoint => 
            originalRequest.url.includes(endpoint)
          );
          
          if (shouldSkipRedirect) {
            console.log('🔍 Skipping redirect for non-critical 401 on:', originalRequest.url);
            return Promise.reject(error);
          }
          
          // Try to refresh token - only attempt once per request
          if (!originalRequest._retry) {
            console.log('🔄 Attempting token refresh for:', originalRequest.url);
            originalRequest._retry = true;
            
            try {
              // First check if we have a refresh token
              const refreshToken = localStorage.getItem('refreshToken');
              
              // Also check if we might have a newer access token already
              // (could happen if another request refreshed while this one was in flight)
              const currentToken = localStorage.getItem('accessToken');
              const requestToken = originalRequest.headers.Authorization?.replace('Bearer ', '');
              
              if (currentToken && currentToken !== requestToken) {
                console.log('📋 Using newer token from localStorage');
                // Use the newer token without making a refresh request
                originalRequest.headers.Authorization = `Bearer ${currentToken}`;
                return httpClient(originalRequest);
              }
              
              if (refreshToken) {
                console.log('🔑 Calling refresh token endpoint');
                const response = await axios.post(
                  `${API_CONFIG.getApiUrl()}/auth/refresh`,
                  { refreshToken },
                  { timeout: 5000 } // Add timeout to refresh request
                );
                
                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                console.log('✅ Token refresh successful');
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return httpClient(originalRequest);
              } else {
                console.warn('⚠️ No refresh token available');
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError?.message || 'Unknown error');
            }
          }
          
          // Check if we're already on a login page before clearing auth
          const isLoginPage = window.location.pathname.includes('/login') || 
                             window.location.pathname.includes('-login');
          
          if (!isLoginPage) {
            console.log('🧹 Clearing auth data after failed refresh');
            // Clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            
            // Preserve selected child if available (to help with re-login experience)
            const selectedChild = localStorage.getItem('selectedChild');
            const parentId = localStorage.getItem('parent_id');
            
            // Only show toast if not in login flow already
            if (API_CONFIG.FEATURES.DEBUG_MODE) {
              toast.error('Your session has expired. Please login again.');
            }
            
            // Store current URL to redirect back after login
            try {
              sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            } catch (e) {
              console.error('Failed to save redirect path', e);
            }
            
            // Redirect to appropriate login page based on last known role
            const lastRole = localStorage.getItem('role') || 'parent';
            localStorage.setItem('preferredRole', lastRole); // Remember for login page
            
            const loginPath = lastRole === 'teacher' ? '/teacher-login' : 
                            lastRole === 'admin' ? '/admin-login' : 
                            '/login';
                            
            console.log(`🚪 Redirecting to ${loginPath} after auth failure`);
            window.location.href = loginPath;
            
            // Restore selected child and parent_id after clearing localStorage
            if (selectedChild) localStorage.setItem('selectedChild', selectedChild);
            if (parentId) localStorage.setItem('parent_id', parentId);
          }
          break;
        }

        case 403: {
          // Forbidden - Insufficient permissions
          console.warn('🚫 Access forbidden');
          toast.error('You do not have permission to access this resource.');
          break;
        }

        case 404:
          // Not found
          console.warn('🔍 Resource not found:', error.config.url);
          if (API_CONFIG.FEATURES.DEBUG_MODE) {
            toast.error(`Resource not found: ${error.config.url}`);
          }
          break;

        case 422:
          // Validation error
          console.warn('📝 Validation error:', data);
          if (data.message) {
            toast.error(data.message);
          } else if (data.errors) {
            // Handle multiple validation errors
            Object.values(data.errors).flat().forEach(err => {
              toast.error(err);
            });
          }
          break;

        case 429:
          // Rate limiting
          console.warn('⏱️ Rate limit exceeded');
          toast.warning('Too many requests. Please wait a moment.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error('🔥 Server error:', status, data);
          toast.error('Server error. Please try again later.');
          break;

        default:
          console.error('🚨 API Error:', status, data);
          toast.error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      console.error('🌐 Network Error:', error.message);
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Other error
      console.error('❌ Error:', error.message);
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const api = {
  // GET request
  get: (url, config = {}) => {
    return httpClient.get(url, config);
  },

  // POST request
  post: (url, data = {}, config = {}) => {
    return httpClient.post(url, data, config);
  },

  // PUT request
  put: (url, data = {}, config = {}) => {
    return httpClient.put(url, data, config);
  },

  // PATCH request
  patch: (url, data = {}, config = {}) => {
    return httpClient.patch(url, data, config);
  },

  // DELETE request
  delete: (url, config = {}) => {
    return httpClient.delete(url, config);
  },

  // File upload
  upload: (url, formData, onProgress = null) => {
    return httpClient.post(url, formData, {
      timeout: API_CONFIG.TIMEOUT.UPLOAD,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await httpClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('🏥 Health check failed:', error.message);
    return false;
  }
};

// Test connection to API
export const testConnection = async () => {
  try {
    // Try production API first
    const prodResponse = await axios.get(`${API_CONFIG.BASE_URL}/health`, { timeout: 5000 });
    if (prodResponse.status === 200) {
      return { success: true, url: API_CONFIG.BASE_URL, type: 'production' };
    }
  } catch (prodError) {
    console.log('Production API not reachable, trying local...');
  }

  try {
    // Try local API
    const localResponse = await axios.get(`${API_CONFIG.LOCAL_URL}/health`, { timeout: 3000 });
    if (localResponse.status === 200) {
      return { success: true, url: API_CONFIG.LOCAL_URL, type: 'local' };
    }
  } catch (localError) {
    console.warn('Local API not reachable');
  }

  return { success: false, url: null, type: null };
};

export default httpClient;
