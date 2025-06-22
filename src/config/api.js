// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://youngeagles-api-server.up.railway.app/api',
  LOCAL_URL: import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:3001/api',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Get the appropriate API URL based on environment
  getApiUrl() {
    // Use local API during development for Phase 6 testing
    const forceLocal = import.meta.env.VITE_FORCE_LOCAL_API === 'true';
    if (this.isDevelopment || forceLocal) {
      console.log('🔧 Using LOCAL API for development:', this.LOCAL_URL);
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
    CHILDREN: '/children',
    REGISTER_CHILD: '/auth/register-child',
    
    // Teacher-specific
    TEACHER_DASHBOARD: '/teacher/dashboard',
    TEACHER_CLASSES: '/teacher/classes',
    
    // Admin-specific
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_TEACHERS: '/admin/teachers',
    ADMIN_PARENTS: '/admin/parents',
    
    // Homework
    HOMEWORK_LIST: '/homeworks/list',
    HOMEWORK_SUBMIT: '/homework/submit/:homeworkId',
    HOMEWORK_CREATE: '/homework/create',
    HOMEWORK_DETAIL: '/homeworks/:id',
    HOMEWORK_FOR_PARENT: '/homework/parent/:parentId/child/:childId',
    HOMEWORK_FOR_TEACHER: '/homework/teacher/:teacherId',
    HOMEWORK_SUBMISSIONS: '/homework/submissions/parent/:parentId',
    HOMEWORK_SUBMISSION_UPDATE: '/homework/submissions/:submissionId',
    HOMEWORK_SUBMISSION_DELETE: '/homework/submissions/:submissionId',
    
    // Assignment Management (Phase 6)
    ASSIGNMENT_CREATE: '/homework/create',
    ASSIGNMENT_UPDATE: '/homework/:homeworkId',
    ASSIGNMENT_DELETE: '/homework/:homeworkId',
    ASSIGNMENT_SUBMISSIONS: '/homework/:homeworkId/submissions',
    SUBMISSION_GRADE: '/homework/submissions/:submissionId/grade',
    
    // Grades
    HOMEWORK_GRADES: '/homeworks/grades/child/:childId',
    
    // Reports
    REPORTS: '/public/parent/reports',
    
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

