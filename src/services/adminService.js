import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class AdminService {
  // Get admin dashboard data
  async getDashboardData() {
    const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    return response.data;
  }

  // Get all users
  async getUsers() {
    try {
      // Try the correct endpoint for the backend
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_USERS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (error.response?.status === 404) {
        // If not found, try the alternative endpoint format
        try {
          const teachersResponse = await api.get(API_CONFIG.ENDPOINTS.ADMIN_TEACHERS);
          return teachersResponse.data;
        } catch (innerError) {
          console.error('Both user endpoints failed:', innerError);
          throw innerError;
        }
      } else {
        throw error;
      }
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Use the correct endpoint based on the user role that matches the backend routes
      let endpoint;
      
      if (userData.role === 'teacher') {
        // The backend expects /admin/teachers for teacher creation
        endpoint = API_CONFIG.ENDPOINTS.ADMIN_TEACHERS;
      } else if (userData.role === 'parent') {
        // The backend expects /admin/parents for parent creation
        endpoint = API_CONFIG.ENDPOINTS.ADMIN_PARENTS;
      } else {
        endpoint = API_CONFIG.ENDPOINTS.ADMIN_USERS;
      }
      
      console.log(`Creating ${userData.role} using endpoint: ${endpoint}`);
      const response = await api.post(endpoint, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      console.error('Request details:', {
        role: userData.role,
        email: userData.email,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
      
      // Extract and throw a more specific error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Missing required fields. Please ensure all fields are completed.');
      } else if (error.response?.status === 409) {
        throw new Error('User with this email already exists.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to create users.');
      } else {
        throw new Error('Failed to create user. Please try again.');
      }
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      // Use the correct endpoint based on the user role that matches the backend routes
      let endpoint;
      
      if (userData.role === 'teacher') {
        // The backend expects /admin/teachers/:id for teacher updates
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_TEACHERS}/${userId}`;
      } else if (userData.role === 'parent') {
        // The backend expects /admin/parents/:id for parent updates
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_PARENTS}/${userId}`;
      } else {
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`;
      }
      
      console.log(`Updating ${userData.role} using endpoint: ${endpoint}`);
      const response = await api.put(endpoint, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      console.error('Request details:', {
        role: userData.role,
        userId: userId,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
      
      // Extract and throw a more specific error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Missing required fields. Please ensure all fields are completed.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to update this user.');
      } else {
        throw new Error('Failed to update user. Please try again.');
      }
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      // First check if this is a teacher or parent by retrieving user details
      const users = await this.getUsers();
      const user = users.find(u => u.id.toString() === userId.toString());
      
      let endpoint;
      if (user?.role === 'teacher') {
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_TEACHERS}/${userId}`;
      } else if (user?.role === 'parent') {
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_PARENTS}/${userId}`;
      } else {
        endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`;
      }
      
      console.log(`Deleting user with role ${user?.role} using endpoint: ${endpoint}`);
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      console.error('Request details:', {
        userId: userId,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
      
      // Extract and throw a more specific error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to delete this user.');
      } else {
        throw new Error('Failed to delete user. Please try again.');
      }
    }
  }

  // Other methods remain the same...
  
  // Get system statistics
  async getSystemStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  // Get all homework assignments (admin view)
  async getAllHomework() {
    const response = await api.get('/admin/homework');
    return response.data;
  }

  // Get system logs
  async getSystemLogs() {
    const response = await api.get('/admin/logs');
    return response.data;
  }

  // Get reports
  async getReports(reportType) {
    const response = await api.get(`/admin/reports/${reportType}`);
    return response.data;
  }

  // Send system announcement
  async sendAnnouncement(announcementData) {
    try {
      const response = await api.post('/admin/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Failed to send announcement:', error);
      throw error;
    }
  }

  // Mock data methods remain the same...
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;
