import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Log API configuration
console.log('🌐 API Base URL:', API_BASE_URL);

// Request cache and debouncing
const requestCache = new Map();
const pendingRequests = new Map();
const CACHE_DURATION = 30000; // 30 seconds
const REQUEST_DELAY = 100; // 100ms delay between requests

// Helper function to create cache key
const createCacheKey = (method, url, params) => {
  return `${method.toUpperCase()}:${url}:${JSON.stringify(params || {})}`;
};

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

// Debounced request function
const debouncedRequest = async (method, url, data = null, config = {}) => {
  const cacheKey = createCacheKey(method, url, data);
  
  // Check cache first
  if (requestCache.has(cacheKey)) {
    const cacheEntry = requestCache.get(cacheKey);
    if (isCacheValid(cacheEntry)) {
      console.log('📦 Cache Hit:', cacheKey);
      return Promise.resolve(cacheEntry.data);
    } else {
      requestCache.delete(cacheKey);
    }
  }
  
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    console.log('⏳ Request Pending:', cacheKey);
    return pendingRequests.get(cacheKey);
  }
  
  // Create new request with delay
  const requestPromise = new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        let response;
        switch (method.toLowerCase()) {
        case 'get':
          response = await apiClient.get(url, config);
          break;
        case 'post':
          response = await apiClient.post(url, data, config);
          break;
        case 'put':
          response = await apiClient.put(url, data, config);
          break;
        case 'delete':
          response = await apiClient.delete(url, config);
          break;
        case 'patch':
          response = await apiClient.patch(url, data, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
        }
        
        // Cache successful GET requests
        if (method.toLowerCase() === 'get' && response.status === 200) {
          requestCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
          });
        }
        
        pendingRequests.delete(cacheKey);
        resolve(response);
      } catch (error) {
        pendingRequests.delete(cacheKey);
        reject(error);
      }
    }, REQUEST_DELAY);
  });
  
  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const retryRequest = async (config, retryCount = 0) => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  if (retryCount >= maxRetries) {
    throw new Error('Max retries exceeded');
  }
  
  const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
  console.log(`⏳ Retrying request in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    return await apiClient(config);
  } catch (error) {
    if (error.response?.status === 429) {
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle 429 - Too Many Requests with retry
    if (error.response?.status === 429) {
      console.log('🚦 Rate limited, attempting retry...');
      try {
        return await retryRequest(error.config);
      } catch {
        console.error('❌ Retry failed after max attempts');
        return Promise.reject(error);
      }
    }
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API Service methods
const apiService = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  // Generic HTTP methods with caching and debouncing
  get: (url, config = {}) => debouncedRequest('get', url, null, config),
  post: (url, data = {}, config = {}) => debouncedRequest('post', url, data, config),
  put: (url, data = {}, config = {}) => debouncedRequest('put', url, data, config),
  delete: (url, config = {}) => debouncedRequest('delete', url, null, config),
  patch: (url, data = {}, config = {}) => debouncedRequest('patch', url, data, config),

  // Cache management
  clearCache: () => {
    requestCache.clear();
    pendingRequests.clear();
    console.log('🧹 API cache cleared');
  },
  
  // Get cache stats
  getCacheStats: () => {
    return {
      cacheSize: requestCache.size,
      pendingRequests: pendingRequests.size,
      cacheKeys: Array.from(requestCache.keys())
    };
  },

  // Health check
  healthCheck: () => apiClient.get('/health'),

  // Auth endpoints
  auth: {
    parentLogin: (credentials) => apiClient.post('/api/auth/parent-login', credentials),
    teacherLogin: (credentials) => {
      // API expects 'username' field instead of 'email' for teachers
      const teacherCreds = {
        username: credentials.email || credentials.username,
        password: credentials.password
      };
      return apiClient.post('/api/auth/teacher-login', teacherCreds);
    },
    adminLogin: (credentials) => apiClient.post('/api/auth/admin-login', credentials)
  },

  // Children endpoints
  children: {
    getAll: () => apiClient.get('/api/children'),
    getById: (id) => apiClient.get(`/api/children/${id}`),
    getByParent: (parentId) => apiClient.get(`/api/children/parent/${parentId}`)
  },

  // Classes endpoints
  classes: {
    getAll: () => apiClient.get('/api/classes'),
    getById: (id) => apiClient.get(`/api/classes/${id}`),
    getByTeacher: (teacherId) => apiClient.get(`/api/classes/teacher/${teacherId}`),
    getChildren: (classId) => apiClient.get(`/api/classes/${classId}/children`)
  },

  // Homework endpoints
  homework: {
    // Get homework for parents
    getByParent: (parentId, childId = null) => {
      const params = childId ? `?childId=${childId}` : '';
      return apiClient.get(`/api/homework/parent/${parentId}${params}`);
    },
    
    // Get homework for specific child
    getByChild: (childId) => apiClient.get(`/api/homework/child/${childId}`),
    
    // Get specific homework assignment
    getById: (homeworkId) => apiClient.get(`/api/homework/${homeworkId}`),
    
    // Student submission endpoints
    submit: (homeworkId, data) => apiClient.post(`/api/homework/${homeworkId}/submit`, data),
    getSubmission: (homeworkId) => apiClient.get(`/api/homework/${homeworkId}/submission`),
    
    // Teacher endpoints for creating and managing homework
    create: (homeworkData) => apiClient.post('/api/homework', homeworkData),
    update: (homeworkId, homeworkData) => apiClient.put(`/api/homework/${homeworkId}`, homeworkData),
    delete: (homeworkId) => apiClient.delete(`/api/homework/${homeworkId}`),
    
    // Get homework created by teacher
    getByTeacher: (teacherId) => apiClient.get(`/api/homework/teacher/${teacherId}`),
    
    // Get homework for a specific class
    getByClass: (classId) => apiClient.get(`/api/homework/class/${classId}`),
    
    // Bulk assign homework to multiple students/classes
    bulkAssign: (homeworkData) => apiClient.post('/api/homework/bulk-assign', homeworkData),
    
    // Grade and provide feedback on submissions
    grade: (homeworkId, studentId, gradeData) => 
      apiClient.post(`/api/homework/${homeworkId}/student/${studentId}/grade`, gradeData),
    
    // Get all submissions for a homework assignment
    getSubmissions: (homeworkId) => apiClient.get(`/api/homework/${homeworkId}/submissions`),
    
    // Get submission statistics
    getStats: (homeworkId) => apiClient.get(`/api/homework/${homeworkId}/stats`),
    
    // File upload for homework attachments
    uploadAttachment: (file, homeworkId = null) => {
      const formData = new FormData();
      formData.append('file', file);
      if (homeworkId) formData.append('homeworkId', homeworkId);
      
      return apiClient.post('/api/homework/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    
    // Download homework files
    downloadFile: (fileId) => apiClient.get(`/api/homework/files/${fileId}`, {
      responseType: 'blob'
    })
  },

  // Events endpoints
  events: {
    // Get all events
    getAll: () => apiClient.get('/api/events'),
    
    // Get event by ID
    getById: (eventId) => apiClient.get(`/api/events/${eventId}`),
    
    // Create new event (admin only)
    create: (eventData) => apiClient.post('/api/events', eventData),
    
    // Update event (admin only)
    update: (eventId, eventData) => apiClient.put(`/api/events/${eventId}`, eventData),
    
    // Delete event (admin only)
    delete: (eventId) => apiClient.delete(`/api/events/${eventId}`),
    
    // Get events by date range
    getByDateRange: (startDate, endDate) => apiClient.get(`/api/events/range?start=${startDate}&end=${endDate}`),
    
    // Get upcoming events
    getUpcoming: () => apiClient.get('/api/events/upcoming'),
    
    // Mark event as read/attended
    markAsRead: (eventId) => apiClient.post(`/api/events/${eventId}/read`)
  },

  // Attendance endpoints (Updated to match backend implementation)
  attendance: {
    // Get attendance for teacher's class on specific date (defaults to today)
    getByClass: (date = null) => {
      const endpoint = date ? `/api/attendance/class?date=${date}` : '/api/attendance/class';
      return apiClient.get(endpoint);
    },
    
    // Mark individual student attendance
    markStudent: (childId, date, status, notes = null) => apiClient.post('/api/attendance/mark', {
      childId,
      date,
      status,
      notes
    }),
    
    // Bulk mark attendance for multiple students
    bulkMark: (date, attendanceRecords) => apiClient.post('/api/attendance/bulk-mark', {
      date,
      attendanceRecords
    }),
    
    // Get attendance history for date range
    getHistory: (startDate, endDate) => apiClient.get(`/api/attendance/history/${startDate}/${endDate}`),
    
    // Get attendance statistics for specific month (defaults to current month)
    getStats: (month = null) => {
      const endpoint = month ? `/api/attendance/stats/${month}` : '/api/attendance/stats';
      return apiClient.get(endpoint);
    }
  },

  // Notifications endpoints
  notifications: {
    // Get all notifications for the current user
    getAll: () => apiClient.get('/api/notifications'),
    
    // Get notification by ID
    getById: (notificationId) => apiClient.get(`/api/notifications/${notificationId}`),
    
    // Mark notification as read
    markAsRead: (notificationId) => apiClient.post(`/api/notifications/${notificationId}/read`),
    
    // Mark all notifications as read
    markAllAsRead: () => apiClient.post('/api/notifications/mark-all-read'),
    
    // Get unread notifications count
    getUnreadCount: () => apiClient.get('/api/notifications/unread-count'),
    
    // Get notifications by type (homework, message, announcement)
    getByType: (type) => apiClient.get(`/api/notifications?type=${type}`),
    
    // Delete notification
    delete: (notificationId) => apiClient.delete(`/api/notifications/${notificationId}`),
    
    // Send notification (admin/teacher only)
    send: (notificationData) => apiClient.post('/api/notifications/send', notificationData)
  },

  // Payment endpoints
  payments: {
    // Get payment proofs for parent
    getProofs: () => apiClient.get('/api/payments/proofs/parent'),
    
    // Submit payment proof
    submitProof: (formData) => apiClient.post('/api/payments/proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    
    // Get payment proof by ID
    getProofById: (proofId) => apiClient.get(`/api/payments/proof/${proofId}`),
    
    // Get payment history
    getHistory: () => apiClient.get('/api/payments/history'),
    
  // Get payment statistics
    getStats: () => apiClient.get('/api/payments/stats')
  },

  // AI endpoints
  ai: {
    // Start AI grading for submissions
    startGrading: (submissions) => apiClient.post('/api/ai/grading/start', { submissions }),
    
    // Get grading queue status
    getGradingQueue: () => apiClient.get('/api/ai/grading/queue'),
    
    // Get grading results for specific submission
    getGradingResults: (submissionId) => apiClient.get(`/api/ai/grading/results/${submissionId}`),
    
    // Generate lesson content
    generateLesson: (lessonData) => apiClient.post('/api/ai/lessons/generate', lessonData),
    
    // AI service health check
    healthCheck: () => apiClient.get('/api/ai/health')
  }
};

export default apiService;
