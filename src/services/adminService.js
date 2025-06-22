import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class AdminService {
  // Get admin dashboard data
  async getDashboardData() {
    const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    return response.data;
  }

  // Get all users (returns combined users from both users and staff tables)
  async getUsers(page = 1, limit = 20, search = '') {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_USERS, {
        params: { page, limit, search }
      });
      return response.data.users || response.data; // Handle both formats
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      console.log(`Creating ${userData.role} using unified endpoint`);
      const response = await api.post(API_CONFIG.ENDPOINTS.ADMIN_USERS, userData);
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
      console.log(`Updating ${userData.role} using unified endpoint`);
      const response = await api.put(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`, userData);
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
  async deleteUser(userId, userSource) {
    try {
      console.log(`Deleting user using unified endpoint`);
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`, {
        data: { source: userSource }
      });
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

  // Dashboard & Analytics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async getQuickActions() {
    try {
      const response = await api.get('/admin/quick-actions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      throw error;
    }
  }

  // Children Management
  async getChildren(page = 1, limit = 20, search = '') {
    try {
      const response = await api.get('/admin/children', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch children:', error);
      throw error;
    }
  }

  async createChild(childData) {
    try {
      const response = await api.post('/admin/children', childData);
      return response.data;
    } catch (error) {
      console.error('Failed to create child:', error);
      throw error;
    }
  }

  async updateChild(childId, childData) {
    try {
      const response = await api.put(`/admin/children/${childId}`, childData);
      return response.data;
    } catch (error) {
      console.error('Failed to update child:', error);
      throw error;
    }
  }

  async deleteChild(childId) {
    try {
      const response = await api.delete(`/admin/children/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete child:', error);
      throw error;
    }
  }

  // System Health
  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system-health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;
