import { api } from './httpClient.js';
import { API_CONFIG } from '../config/api.js';

class ParentService {
  constructor() {
    this.apiUrl = API_CONFIG.BASE_URL;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Request-Source': 'pwa-parent-service'
    };
  }

  // Get parent dashboard data
  async getDashboardData(parentId) {
    try {
      console.log('ParentService: Fetching real dashboard data for parent:', parentId);
      
      // Use existing API pattern for consistency
      const response = await api.get(`/api/parent/${parentId}/dashboard`, {
        headers: {
          'X-Request-Source': 'pwa-parent-dashboard'
        }
      });
      
      console.log('✅ Real dashboard data fetched:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Return empty data structure instead of mock data
      return {
        success: false,
        error: error.message,
        data: {
          stats: {
            totalHomework: 0,
            completedHomework: 0,
            pendingHomework: 0,
            upcomingEvents: 0
          },
          recentActivity: [],
          upcomingHomework: []
        }
      };
    }
  }

  // Get children list
  async getChildren() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CHILDREN, {
        headers: {
          'X-Request-Source': 'pwa-parent-children',
          'Cache-Control': 'no-cache'
        }
      });
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Error fetching children:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get homework list
  async getHomework(childId, parentId) {
    try {
      console.log('ParentService: Fetching real homework data for child:', childId);
      
      // Use the existing API pattern with the homework endpoint
      const url = API_CONFIG.ENDPOINTS.HOMEWORK_FOR_PARENT
        .replace(':parentId', parentId)
        .replace(':childId', childId);
      
      const response = await api.get(url, {
        headers: {
          'X-Request-Source': 'pwa-parent-homework',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('✅ Real homework data fetched:', response.data);
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('❌ Error fetching homework:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  }

  // Submit homework
  async submitHomework(homeworkId, submissionData) {
    try {
      const response = await api.post(
        `${API_CONFIG.ENDPOINTS.HOMEWORK_SUBMIT}/${homeworkId}`,
        submissionData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to submit homework:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications() {
    const response = await api.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    return response.data;
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`${API_CONFIG.ENDPOINTS.MARK_READ}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Get messages
  async getMessages() {
    const response = await api.get(API_CONFIG.ENDPOINTS.MESSAGES);
    return response.data;
  }

  // Send message
  async sendMessage(messageData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.SEND_MESSAGE, messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

// Create singleton instance
const parentService = new ParentService();

// Export both the class and the singleton instance
export { ParentService, parentService };
export default parentService;

