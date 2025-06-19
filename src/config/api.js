// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://youngeagles-api-server.up.railway.app/api',
  LOCAL_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Get the appropriate API URL based on environment
  getApiUrl() {
    // Always use production API unless explicitly set to use local
    const forceLocal = import.meta.env.VITE_FORCE_LOCAL_API === 'true';
    if (forceLocal && this.isDevelopment) {
      return this.LOCAL_URL;
    }
    return this.BASE_URL;
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    TEACHER_LOGIN: '/auth/teacher-login',
    ADMIN_LOGIN: '/auth/admin-login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_TOKEN: '/auth/verify',
    
    // User Management
    USER_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    
    // Parent-specific
    PARENT_DASHBOARD: '/parent/dashboard',
    CHILDREN: '/parent/children',
    
    // Teacher-specific
    TEACHER_DASHBOARD: '/teacher/dashboard',
    TEACHER_CLASSES: '/teacher/classes',
    
    // Admin-specific
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    
    // Homework
    HOMEWORK_LIST: '/homework',
    HOMEWORK_SUBMIT: '/homework/submit',
    HOMEWORK_CREATE: '/homework/create',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    MARK_READ: '/notifications/read',
    
    // Messages
    MESSAGES: '/messages',
    SEND_MESSAGE: '/messages/send',
  },
  
  // Request timeouts
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000,  // 30 seconds for file uploads
    AUTH: 5000,     // 5 seconds for auth requests
  },
  
  // Feature flags
  FEATURES: {
    PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
    OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  }
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  const baseUrl = API_CONFIG.getApiUrl();
  return `${baseUrl}${endpoint}`;
};

// Helper function to log API calls in development
export const logApiCall = (method, url, data = null) => {
  if (API_CONFIG.FEATURES.DEBUG_MODE) {
    console.group(`🌐 API Call: ${method.toUpperCase()}`);
    console.log('URL:', url);
    if (data) console.log('Data:', data);
    console.log('Environment:', API_CONFIG.isDevelopment ? 'Development' : 'Production');
    console.groupEnd();
  }
};

export default API_CONFIG;

