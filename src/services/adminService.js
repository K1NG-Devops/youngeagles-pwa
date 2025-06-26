import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class AdminService {
  // Get admin dashboard data
  async getDashboardData() {
    const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    return response.data;
  }

  // Get all users, optionally filtered by role
  async getUsers(page = 1, limit = 20, search = '', role = 'all') {
    try {
      const params = { page, limit, search, role };
      // If the role is 'all', we don't need to send it as a parameter
      if (role === 'all') {
        delete params.role;
      }
      
      // For teachers specifically, we need to make sure we get staff table data
      if (role === 'teacher') {
        params.includeStaff = true;
      }
      
      console.log('🔍 AdminService.getUsers params:', params);
      
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_USERS, { params });
      
      console.log('🔍 AdminService.getUsers raw response:', response.data);
      
      return response.data.users || response.data; // Handle both formats
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
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
      const response = await api.put(`/admin/users/${userId}`, userData);
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
      const response = await api.delete(`/admin/users/${userId}`, {
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


  // Delete parent specifically (from users table)
  async deleteParent(parentId) {
    try {
      const response = await api.delete(`/admin/parents/${parentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete parent:', error);
      console.error('Request details:', {
        parentId: parentId,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
      
      // Extract and throw a more specific error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Parent not found.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to delete this parent.');
      } else {
        throw new Error('Failed to delete parent. Please try again.');
      }
    }
  }

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
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async getQuickActions() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_QUICK_ACTIONS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      throw error;
    }
  }

  // Children Management
  async getChildren(page = 1, limit = 500, search = '', getAllChildren = false) {
    try {
      const params = { page, limit, search };
      
      // If we want all children, use the 'all' parameter supported by the API
      if (getAllChildren) {
        params.all = 'true';
      }
      
      const response = await api.get('/admin/children', { params });
      console.log(`📊 Retrieved ${response.data?.data?.length || 0} children from API`);
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

  // Teacher-specific methods
  async getTeachers(page = 1, limit = 20, search = '') {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search, role: 'teacher', includeStaff: 'true' }
      });
      return response.data.data || response.data; // Handle both formats
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      throw error;
    }
  }

  async getTeacher(teacherId) {
    try {
      const response = await api.get(`/admin/teachers/${teacherId}`);
      return response.data.teacher;
    } catch (error) {
      console.error('Failed to fetch teacher:', error);
      throw error;
    }
  }

  async updateTeacher(teacherId, teacherData) {
    try {
      console.log('Updating teacher with staff table fields:', teacherData);
      const response = await api.put(`/admin/teachers/${teacherId}`, teacherData);
      return response.data;
    } catch (error) {
      console.error('Failed to update teacher:', error);
      console.error('Request details:', {
        teacherId: teacherId,
        statusCode: error.response?.status,
        responseData: error.response?.data
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Teacher not found.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to update this teacher.');
      } else {
        throw new Error('Failed to update teacher. Please try again.');
      }
    }
  }

  async deleteTeacher(teacherId) {
    try {
      console.log('Deleting teacher from staff table');
      const response = await api.delete(`/admin/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 404) {
        throw new Error('Teacher not found.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('You do not have permission to delete this teacher.');
      } else {
        throw new Error('Failed to delete teacher. Please try again.');
      }
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;
