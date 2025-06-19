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
    const response = await api.get(API_CONFIG.ENDPOINTS.ADMIN_USERS);
    return response.data;
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
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

  // Mock data for development/fallback
  getMockDashboardData() {
    return {
      adminStats: {
        totalUsers: 150,
        totalTeachers: 12,
        totalParents: 138,
        totalHomeworks: 45,
        totalSubmissions: 234,
        systemHealth: 'Excellent'
      },
      recentActivity: [
        {
          id: 1,
          type: 'user_registered',
          description: 'New parent registered: Sarah Johnson',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'info'
        },
        {
          id: 2,
          type: 'homework_created',
          description: 'Teacher posted new homework: Math Worksheet',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          severity: 'info'
        },
        {
          id: 3,
          type: 'system_backup',
          description: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 21600000).toISOString(),
          severity: 'success'
        }
      ],
      systemMetrics: {
        uptime: '99.9%',
        responseTime: '125ms',
        activeUsers: 78,
        storageUsed: '2.4GB',
        bandwidth: '15.2 MB/s'
      }
    };
  }

  getMockUsers() {
    return [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        role: 'parent',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        children: ['Emma Johnson']
      },
      {
        id: 2,
        name: 'Mrs. Smith',
        email: 'smith@youngeagles.com',
        role: 'teacher',
        status: 'active',
        lastLogin: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
        classes: ['Grade 3A', 'Grade 3B']
      },
      {
        id: 3,
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        role: 'parent',
        status: 'active',
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 1209600000).toISOString(), // 14 days ago
        children: ['Liam Brown']
      },
      {
        id: 4,
        name: 'Admin User',
        email: 'admin@youngeagles.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 31536000000).toISOString() // 365 days ago
      }
    ];
  }

  getMockSystemStats() {
    return {
      userStats: {
        totalUsers: 150,
        activeUsers: 78,
        newUsersThisMonth: 12,
        userGrowthRate: 8.5
      },
      homeworkStats: {
        totalHomework: 45,
        completedHomework: 234,
        pendingHomework: 23,
        avgCompletionRate: 91.2
      },
      systemPerformance: {
        uptime: 99.9,
        avgResponseTime: 125,
        errorRate: 0.1,
        requestsPerDay: 15420
      },
      storageStats: {
        totalStorage: '10GB',
        usedStorage: '2.4GB',
        availableStorage: '7.6GB',
        storageGrowthRate: 15.3
      }
    };
  }

  getMockAllHomework() {
    return [
      {
        id: 1,
        title: 'Math Worksheet - Addition',
        subject: 'Mathematics',
        teacher: 'Mrs. Smith',
        class: 'Grade 3A',
        assignedDate: new Date(Date.now() - 172800000).toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        submissions: 18,
        totalStudents: 25,
        completionRate: 72
      },
      {
        id: 2,
        title: 'Science Experiment Report',
        subject: 'Science',
        teacher: 'Ms. Davis',
        class: 'Grade 3B',
        assignedDate: new Date(Date.now() - 86400000).toISOString(),
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        submissions: 20,
        totalStudents: 23,
        completionRate: 87
      }
    ];
  }

  getMockSystemLogs() {
    return [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'User login successful: sarah.johnson@email.com',
        source: 'AuthService',
        ip: '192.168.1.1'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: 'WARN',
        message: 'Failed login attempt: invalid.user@email.com',
        source: 'AuthService',
        ip: '192.168.1.5'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        level: 'INFO',
        message: 'Homework submission uploaded: math_worksheet.pdf',
        source: 'HomeworkService',
        ip: '192.168.1.10'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        level: 'ERROR',
        message: 'Database connection timeout',
        source: 'DatabaseService',
        ip: 'localhost'
      }
    ];
  }

  getMockReports(reportType) {
    switch (reportType) {
      case 'users':
        return {
          type: 'users',
          generatedAt: new Date().toISOString(),
          data: {
            totalUsers: 150,
            usersByRole: {
              parent: 138,
              teacher: 12,
              admin: 2
            },
            userRegistrations: [
              { month: 'Jan', count: 15 },
              { month: 'Feb', count: 12 },
              { month: 'Mar', count: 18 },
              { month: 'Apr', count: 20 },
              { month: 'May', count: 14 },
              { month: 'Jun', count: 22 }
            ],
            activeUsers: 78,
            inactiveUsers: 72
          }
        };
      
      case 'homework':
        return {
          type: 'homework',
          generatedAt: new Date().toISOString(),
          data: {
            totalHomework: 45,
            completionRates: [
              { subject: 'Mathematics', rate: 92 },
              { subject: 'Science', rate: 87 },
              { subject: 'English', rate: 95 },
              { subject: 'Social Studies', rate: 83 }
            ],
            submissionTrends: [
              { month: 'Jan', submissions: 180 },
              { month: 'Feb', submissions: 165 },
              { month: 'Mar', submissions: 210 },
              { month: 'Apr', submissions: 234 },
              { month: 'May', submissions: 198 },
              { month: 'Jun', submissions: 245 }
            ],
            avgCompletionTime: '2.5 days'
          }
        };
      
      default:
        return {
          type: reportType,
          generatedAt: new Date().toISOString(),
          data: {
            message: 'No data available for this report type'
          }
        };
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;

