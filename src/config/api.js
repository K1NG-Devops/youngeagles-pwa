// API Configuration
export const API_CONFIG = {
  // Base URLs - These are now sanitized and should NOT have a trailing slash or /api
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://youngeagles-api-server.up.railway.app',
  LOCAL_URL: import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:3001',
  
  // WebSocket Configuration
  WEBSOCKET: {
    URL: import.meta.env.VITE_API_WS_URL || 'wss://youngeagles-api-server.up.railway.app',
    LOCAL_URL: 'ws://localhost:3001',
    PATH: '/socket.io',
    getUrl() {
      const forceLocal = import.meta.env.VITE_FORCE_LOCAL_API === 'true';
      const isLocalDev = API_CONFIG.isDevelopment || forceLocal || window.location.hostname === 'localhost';
      if (isLocalDev) {
        console.log('🔌 Using LOCAL WebSocket URL:', this.LOCAL_URL);
        return this.LOCAL_URL;
      }
      console.log('🔌 Using PRODUCTION WebSocket URL:', this.URL);
      return this.URL;
    }
  },

  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Get the appropriate API URL based on environment, with sanitization
  getApiUrl() {
    const forceLocal = import.meta.env.VITE_FORCE_LOCAL_API === 'true';
    // FORCE LOCAL DEVELOPMENT FOR ADMIN TESTING
    const isLocalDev = this.isDevelopment || forceLocal || window.location.hostname === 'localhost';
    let url = isLocalDev ? this.LOCAL_URL : this.BASE_URL;
    
    // Sanitize the URL to remove any trailing slashes or /api path
    url = url.replace(/\/api\/?$/, '').replace(/\/$/, '');
    
    if (isLocalDev) {
      console.log('🔧 Using SANITIZED LOCAL API:', url);
    } else {
      console.log('🔧 Using SANITIZED PRODUCTION API:', url);
    }
    return url;
  },
  
  // Get base URL for httpClient
  getBaseApiUrl() {
    return this.getApiUrl(); // No /api prefix
  },
  
  // API Endpoints - These are relative paths that will be appended to the base URL
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    TEACHER_LOGIN: '/auth/teacher-login',
    ADMIN_LOGIN: '/auth/admin-login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    VERIFY_TOKEN: '/api/auth/verify',
    
    // User Management
    USER_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    
    // Parent-specific
    PARENT_DASHBOARD: '/parent/dashboard',
    CHILDREN: '/auth/parents',
    REGISTER_CHILD: '/auth/register-child',
    
    // Teacher-specific
    TEACHER_DASHBOARD: '/teacher/dashboard',
    TEACHER_CLASSES: '/teacher/classes',
    TEACHER_PROFILE: '/teacher/profile',
    TEACHER_STATS: '/teacher/stats',
    TEACHER_SUBMISSIONS: '/teacher/submissions',
    TEACHER_ATTENDANCE: '/teacher/attendance',
    GET_TEACHERS: '/teacher',
    
    // Admin-specific
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_TEACHERS: '/admin/teachers',
    ADMIN_PARENTS: '/admin/parents',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_QUICK_ACTIONS: '/admin/quick-actions',
    
    // Homework
    HOMEWORK_LIST: '/homework/list',
    HOMEWORK_SUBMIT: '/homework/submit/:homeworkId',
    HOMEWORK_CREATE: '/homework/create',
    HOMEWORK_DETAIL: '/homework/:id',
    HOMEWORK_FOR_PARENT: '/parent/:parentId/child/:childId',
    HOMEWORK_FOR_TEACHER: '/teacher/:teacherId',
    HOMEWORK_SUBMISSIONS: '/submissions/parent/:parentId',
    HOMEWORK_SUBMISSION_UPDATE: '/submissions/:submissionId',
    HOMEWORK_SUBMISSION_DELETE: '/submissions/:submissionId',
    
    // Assignment Management (Phase 6)
    ASSIGNMENT_CREATE: '/homework/create',
    ASSIGNMENT_UPDATE: '/homework/:homeworkId',
    ASSIGNMENT_DELETE: '/homework/:homeworkId',
    ASSIGNMENT_SUBMISSIONS: '/homework/:homeworkId/submissions',
    SUBMISSION_GRADE: '/submissions/:submissionId/grade',
    
    // Grades
    HOMEWORK_GRADES: '/homeworks/grades/child/:childId',
    
    // Reports
    REPORTS: '/public/parent/reports',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    MARK_READ: '/notifications/read',
    
    // Messages - Enhanced Endpoints
    MESSAGES: '/messages',
    SEND_MESSAGE: '/messages/send',
    GET_CONVERSATIONS: '/messages/conversations',
    GET_CONVERSATION: '/messages/conversations/:conversationId',
    CREATE_CONVERSATION: '/messages/conversations/create',
    MARK_MESSAGE_READ: '/messages/:messageId/read',
    UPLOAD_MESSAGE_ATTACHMENT: '/messages/attachments/upload',
    GET_MESSAGE_HISTORY: '/messages/conversations/:conversationId/history',
    DELETE_MESSAGE: '/messages/:messageId',
    EDIT_MESSAGE: '/messages/:messageId',
    SEARCH_MESSAGES: '/messages/search',
    GET_UNREAD_COUNT: '/messages/unread-count',
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

// Helper function to build full URL (for cases where you need the complete URL)
export const buildUrl = (endpoint) => {
  const baseUrl = API_CONFIG.getBaseApiUrl();
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

