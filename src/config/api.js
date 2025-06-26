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
    
    // More aggressive sanitization to remove any trailing slashes or /api path
    url = url.replace(/\/api\/?$/, '').replace(/\/$/, '');
    
    // Extra debugging to see what URLs we're getting
    if (isLocalDev) {
      console.log('🔧 RAW LOCAL URL:', isLocalDev ? this.LOCAL_URL : this.BASE_URL);
      console.log('🔧 Using SANITIZED LOCAL API:', url);
    } else {
      console.log('🔧 RAW PRODUCTION URL:', this.BASE_URL);
      console.log('🔧 VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);
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
    LOGIN: '/api/auth/login',
    TEACHER_LOGIN: '/api/auth/teacher-login',
    ADMIN_LOGIN: '/api/auth/admin-login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    VERIFY_TOKEN: '/api/auth/verify',
    
    // User Management
    USER_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    
    // Parent-specific
    PARENT_DASHBOARD: '/api/parent/dashboard',
    CHILDREN: '/api/auth/parents',
    REGISTER_CHILD: '/api/auth/register-child',
    
    // Teacher-specific
    TEACHER_DASHBOARD: '/api/teacher/dashboard',
    TEACHER_CLASSES: '/api/teacher/classes',
    TEACHER_PROFILE: '/api/teacher/profile',
    TEACHER_STATS: '/api/teacher/stats',
    TEACHER_SUBMISSIONS: '/api/teacher/submissions',
    TEACHER_ATTENDANCE: '/api/teacher/attendance',
    GET_TEACHERS: '/api/teacher',
    
    // Admin-specific
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_TEACHERS: '/api/admin/teachers',
    ADMIN_PARENTS: '/api/admin/parents',
    ADMIN_ANALYTICS: '/api/admin/analytics',
    ADMIN_QUICK_ACTIONS: '/api/admin/quick-actions',
    
    // Homework
    HOMEWORK_LIST: '/api/homework/list',
    HOMEWORK_SUBMIT: '/api/homework/submit/:homeworkId',
    HOMEWORK_CREATE: '/api/homework/create',
    HOMEWORK_DETAIL: '/api/homework/:id',
    HOMEWORK_FOR_PARENT: '/api/parent/:parentId/child/:childId/homework',
    HOMEWORK_FOR_TEACHER: '/api/homework/teacher/:teacherId',
    HOMEWORK_SUBMISSIONS: '/api/submissions/parent/:parentId',
    HOMEWORK_SUBMISSION_UPDATE: '/api/submissions/:submissionId',
    HOMEWORK_SUBMISSION_DELETE: '/api/submissions/:submissionId',
    
    // Assignment Management (Phase 6)
    ASSIGNMENT_CREATE: '/api/homework/create',
    ASSIGNMENT_UPDATE: '/api/homework/:homeworkId',
    ASSIGNMENT_DELETE: '/api/homework/:homeworkId',
    ASSIGNMENT_SUBMISSIONS: '/api/homework/:homeworkId/submissions',
    SUBMISSION_GRADE: '/api/submissions/:submissionId/grade',
    
    // Grades
    HOMEWORK_GRADES: '/api/homeworks/grades/child/:childId',
    
    // Reports
    REPORTS: '/api/public/parent/reports',
    
    // Notifications
    NOTIFICATIONS: '/api/notifications',
    MARK_READ: '/api/notifications/read',
    
    // Messages - Enhanced Endpoints
    MESSAGES: '/api/messages',
    SEND_MESSAGE: '/api/messages/send',
    GET_CONVERSATIONS: '/api/messages/conversations',
    GET_CONVERSATION: '/api/messages/conversations/:conversationId',
    CREATE_CONVERSATION: '/api/messages/conversations/create',
    MARK_MESSAGE_READ: '/api/messages/:messageId/read',
    UPLOAD_MESSAGE_ATTACHMENT: '/api/messages/attachments/upload',
    GET_MESSAGE_HISTORY: '/api/messages/conversations/:conversationId/history',
    DELETE_MESSAGE: '/api/messages/:messageId',
    EDIT_MESSAGE: '/api/messages/:messageId',
    SEARCH_MESSAGES: '/api/messages/search',
    GET_UNREAD_COUNT: '/api/messages/unread-count',
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

