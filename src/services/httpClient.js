import axios from 'axios';
import { API_CONFIG, logApiCall } from '../config/api.js';
import { toast } from 'react-toastify';

// Create axios instance
const httpClient = axios.create({
  baseURL: API_CONFIG.getApiUrl(),
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
    }

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
        case 401:
          // Unauthorized - Token expired or invalid
          console.warn('🔐 Authentication failed');
          
          // Try to refresh token once
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await axios.post(
                  `${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
                  { refreshToken }
                );
                
                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return httpClient(originalRequest);
              }
            } catch (refreshError) {
              console.error('🔄 Token refresh failed:', refreshError);
            }
          }
          
          // Clear auth data and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          
          // Only show toast in development or if not already on login page
          if (API_CONFIG.FEATURES.DEBUG_MODE && !window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
          }
          
          // Redirect to login (if not already there)
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - Insufficient permissions
          console.warn('🚫 Access forbidden');
          toast.error('You do not have permission to access this resource.');
          break;

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

