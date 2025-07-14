import axios from 'axios';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Log API configuration
console.log('🌐 API Base URL:', API_BASE_URL);

// Request cache and debouncing
const requestCache = new Map();
const pendingRequests = new Map();
const requestTimestamps = [];

// Rate limiting helper
const isRateLimited = () => {
  const now = Date.now();
  // Remove old timestamps outside the window
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > BURST_WINDOW) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length >= BURST_LIMIT;
};

const recordRequest = () => {
  requestTimestamps.push(Date.now());
};
const CACHE_DURATION = 60000; // 60 seconds - longer cache
const REQUEST_DELAY = 300; // 300ms delay between requests
const BURST_LIMIT = 5; // Max 5 requests per burst
const BURST_WINDOW = 2000; // 2 second window

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
  
  // Check rate limiting
  if (isRateLimited()) {
    console.log('🚦 Rate limited, delaying request:', cacheKey);
    await new Promise(resolve => setTimeout(resolve, BURST_WINDOW));
  }
  
  // Create new request with delay
  const requestPromise = new Promise((resolve, reject) => {
    setTimeout(async () => {
      recordRequest();
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
    const user = localStorage.getItem('user');
    
    // Enhanced debugging
    console.log('🔍 Request Interceptor Debug:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'None',
      userInStorage: !!user,
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Auth token added to request');
    } else {
      console.log('⚠️ No auth token found in localStorage');
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
    
    // Handle 401 - Unauthorized with better error handling
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      
      console.log('🔒 Authentication Error:', errorCode, errorMessage);
      
      // Clear stored auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Show appropriate message based on error code
      if (errorCode === 'TOKEN_EXPIRED') {
        console.log('⏰ Token expired, redirecting to login...');
        // You could show a toast notification here if needed
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      } else if (errorCode === 'INVALID_TOKEN') {
        console.log('🚫 Invalid token, redirecting to login...');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?invalid=true';
        }
      } else {
        console.log('❌ Authentication failed, redirecting to login...');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
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

  // Push notification endpoints
  push: {
    getVapidPublicKey: () => apiClient.get('/api/push/vapid-public-key'),
    subscribe: (subscription) => apiClient.post('/api/push/subscribe', subscription),
    unsubscribe: (endpoint) => apiClient.post('/api/push/unsubscribe', { endpoint }),
    sendNotification: (notificationData) => apiClient.post('/api/push/send', notificationData)
  },

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
    adminLogin: (credentials) => apiClient.post('/api/auth/admin-login', credentials),
    
    // Registration endpoints
    register: (userData) => apiClient.post('/api/auth/register', userData),
    parentRegister: (userData) => apiClient.post('/api/auth/parent-register', userData),
    teacherRegister: (userData) => apiClient.post('/api/auth/teacher-register', userData),
    adminRegister: (userData) => apiClient.post('/api/auth/admin-register', userData)
  },

  // Children endpoints
  children: {
    getAll: () => apiClient.get('/api/children'),
    getById: (id) => apiClient.get(`/api/children/${id}`),
    getByParent: (parentId) => apiClient.get(`/api/children/parent/${parentId}`),
    
    // Child registration endpoints
    search: (searchTerm) => apiClient.get(`/api/children/search?q=${encodeURIComponent(searchTerm)}`),
    register: (childData) => apiClient.post('/api/children/register', childData),
    linkToParent: (childId, parentId) => apiClient.post('/api/children/link-parent', { childId, parentId }),
    
    // Create new child (complete registration)
    create: (childData) => apiClient.post('/api/children', childData),
    
    // Update child information
    update: (childId, childData) => apiClient.put(`/api/children/${childId}`, childData),
    
    // Delete child record
    delete: (childId) => apiClient.delete(`/api/children/${childId}`)
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
    
    // Get all payment proofs for admin
    getAllProofs: () => apiClient.get('/api/payments/proofs/admin'),
    
    // Review payment proof (admin only) - using the correct backend endpoint
    reviewProof: (proofId, data) => apiClient.post(`/api/payments/proofs/${proofId}/review`, data),
    
    // Approve payment proof (admin only) - wrapper for review with approved status
    approveProof: (proofId) => apiClient.post(`/api/payments/proofs/${proofId}/review`, { status: 'approved', admin_notes: 'Approved by admin' }),
    
    // Reject payment proof (admin only) - wrapper for review with rejected status
    rejectProof: (proofId, data) => apiClient.post(`/api/payments/proofs/${proofId}/review`, { status: 'rejected', admin_notes: data.reason || 'Rejected by admin' }),
    
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
    getStats: () => apiClient.get('/api/payments/stats'),
    
    // Get payment summary for parent (approved payments only)
    getSummary: () => apiClient.get('/api/payments/summary/parent'),
    
    // Get payment summary for admin (approved payments only)
    getAdminSummary: () => apiClient.get('/api/payments/summary/admin'),
    
    // Delete rejected payment proof
    deleteRejectedProof: (proofId) => apiClient.delete(`/api/payments/proofs/${proofId}`)
  },

  // Users endpoints (admin only)
  users: {
    // Get all users (admin only)
    getAll: () => apiClient.get('/api/users'),
    
    // Get user by ID
    getById: (userId) => apiClient.get(`/api/users/${userId}`),
    
    // Get current user profile (for profile refresh)
    getProfile: () => apiClient.get('/api/users/profile'),
    
    // Create new user
    create: (userData) => apiClient.post('/api/users', userData),
    
    // Update user
    update: (userId, userData) => apiClient.put(`/api/users/${userId}`, userData),
    
    // Delete user
    delete: (userId) => apiClient.delete(`/api/users/${userId}`),
    
    // Upload profile picture with extended timeout and progress tracking
    uploadProfilePicture: (formData) => {
      console.log('📤 Starting profile picture upload to:', `${API_BASE_URL}/api/users/profile-picture`);
      return apiClient.post('/api/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000, // Increased to 2 minutes for file uploads
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload progress: ${percentCompleted}%`);
          }
        }
      });
    },
    
    // Get admin dashboard stats (includes pendingApprovals)
    getStats: () => apiClient.get('/api/users/stats/overview')
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
  },

  // Subscription endpoints
  subscriptions: {
    // Get current user subscription
    getCurrent: () => apiClient.get('/api/subscriptions/current'),
    
    // Get subscription history
    getHistory: () => apiClient.get('/api/subscriptions/history'),
    
    // Get available plans
    getPlans: () => apiClient.get('/api/subscriptions/plans'),
    
    // Upgrade subscription
    upgrade: (planId, billingCycle = 'monthly', paymentMethod = 'payfast') => 
      apiClient.post('/api/subscriptions/upgrade', { 
        planId, 
        billingCycle, 
        paymentMethod 
      }),
    
    // Cancel subscription
    cancel: (reason = null) => apiClient.post('/api/subscriptions/cancel', { reason }),
    
    // Reactivate subscription
    reactivate: () => apiClient.post('/api/subscriptions/reactivate'),
    
    // Get user features based on subscription
    getFeatures: () => apiClient.get('/api/subscriptions/features'),
    
    // Get user usage statistics
    getUsage: () => apiClient.get('/api/subscriptions/usage'),
    
    // Increment feature usage
    incrementUsage: (feature) => apiClient.post('/api/subscriptions/usage/increment', { feature }),
    
    // Check specific feature access
    checkFeatureAccess: (feature) => apiClient.get(`/api/subscriptions/features/${feature}`),
    
    // Get payment history
    getPaymentHistory: (limit = 10, offset = 0) => 
      apiClient.get(`/api/subscriptions/payments?limit=${limit}&offset=${offset}`),
    
    // Admin endpoints
    admin: {
      // Get subscription statistics
      getStats: () => apiClient.get('/api/subscriptions/admin/stats'),
      
      // Create manual subscription
      createManualSubscription: (data) => 
        apiClient.post('/api/subscriptions/admin/manual-subscription', data),
      
      // Get all subscriptions
      getAllSubscriptions: (limit = 50, offset = 0) => 
        apiClient.get(`/api/subscriptions/admin/all?limit=${limit}&offset=${offset}`),
      
      // Update subscription status
      updateSubscriptionStatus: (subscriptionId, status, reason = null) => 
        apiClient.post(`/api/subscriptions/admin/${subscriptionId}/status`, { status, reason }),
      
      // Process refund
      processRefund: (transactionId, amount, reason = null) => 
        apiClient.post('/api/subscriptions/admin/refund', { transactionId, amount, reason })
    }
  },

  // Parent endpoints
  parent: {
    // Get parent's children
    getChildren: () => apiClient.get('/api/parent/children'),
    
    // Teacher token linking
    linkToTeacher: (teacherToken, childId) => apiClient.post('/api/parent/link-to-teacher', {
      teacherToken,
      childId
    }),
    
    getTeacherLinks: () => apiClient.get('/api/parent/teacher-links'),
    
    unlinkFromTeacher: (childId, teacherToken) => apiClient.post('/api/parent/unlink-from-teacher', {
      childId,
      teacherToken
    }),
    
    validateTeacherToken: (teacherToken) => apiClient.post('/api/parent/validate-teacher-token', {
      teacherToken
    }),
    
    // Parent management (admin endpoints)
    admin: {
      // Get all parents with filtering and pagination
      getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/admin/parents?${params}`);
      },
      
      // Get pending child registrations
      getPendingRegistrations: () => apiClient.get('/api/admin/parents/pending-registrations'),
      
      // Get pending parent-child links
      getPendingLinks: () => apiClient.get('/api/admin/parents/pending-links'),
      
      // Approve child registration
      approveRegistration: (registrationId, data = {}) => 
        apiClient.post(`/api/admin/parents/registrations/${registrationId}/approve`, data),
      
      // Reject child registration
      rejectRegistration: (registrationId, data = {}) => 
        apiClient.post(`/api/admin/parents/registrations/${registrationId}/reject`, data),
      
      // Approve parent-child link
      approveLink: (linkId, data = {}) => 
        apiClient.post(`/api/admin/parents/links/${linkId}/approve`, data),
      
      // Reject parent-child link
      rejectLink: (linkId, data = {}) => 
        apiClient.post(`/api/admin/parents/links/${linkId}/reject`, data),
      
      // Update parent category
      updateCategory: (parentId, category) => 
        apiClient.put(`/api/admin/parents/${parentId}/category`, { category }),
      
      // Get parent statistics
      getStats: () => apiClient.get('/api/admin/parents/stats'),
      
      // Export parent data
      exportData: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiClient.get(`/api/admin/parents/export?${params}`, {
          responseType: 'blob'
        });
      },
      
      // Send admin notification
      sendNotification: (notificationData) => 
        apiClient.post('/api/admin/notifications/send', notificationData)
    }
  },

  // Teacher endpoints
  teacher: {
    // Get teacher profile
    getProfile: () => apiClient.get('/api/teacher/profile'),
    
    // Get teacher's students
    getStudents: () => apiClient.get('/api/teacher/students'),
    
    // Teacher token management
    generateToken: (tokenName, maxChildren = 20) => apiClient.post('/api/teacher/generate-token', {
      tokenName,
      maxChildren
    }),
    
    getTokens: () => apiClient.get('/api/teacher/tokens'),
    
    getLinkedChildren: () => apiClient.get('/api/teacher/linked-children'),
    
    deactivateToken: (tokenId) => apiClient.post(`/api/teacher/deactivate-token/${tokenId}`)
  }
};

export default apiService;
