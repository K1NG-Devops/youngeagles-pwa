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
      console.log(`ParentService: Fetching homework for child ${childId} of parent ${parentId}`);
      const response = await api.get(`/parent/${parentId}/child/${childId}/homework`, {
        headers: {
          'X-Request-Source': 'pwa-parent-homework',
          'Cache-Control': 'no-cache',
        },
      });

      console.log(`✅ SUCCESS! Homework fetched successfully:`, response.data);
      return {
        success: true,
        data: response.data.homework || [],
      };
    } catch (error) {
      console.error(`❌ Error fetching homework:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
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

  // Get available contacts (teachers, admins)
  async getAvailableContacts() {
    try {
      // The API endpoint for fetching all teachers
      const response = await api.get(API_CONFIG.ENDPOINTS.GET_TEACHERS); 
      return response.data.teachers || [];
    } catch (error) {
      console.error('Failed to fetch available contacts:', error);
      return []; // Return empty array on failure
    }
  }

  async getConversations() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.GET_CONVERSATIONS);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.GET_CONVERSATION.replace(':conversationId', conversationId);
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  }

  async createConversation(participants, initialMessage = null) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CREATE_CONVERSATION, {
        participants,
        initialMessage
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.MARK_MESSAGE_READ.replace(':messageId', messageId);
      const response = await api.patch(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  async uploadMessageAttachment(file, conversationId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.UPLOAD_MESSAGE_ATTACHMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw error;
    }
  }

  async getMessageHistory(conversationId, page = 1, limit = 50) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.GET_MESSAGE_HISTORY.replace(':conversationId', conversationId);
      const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      throw error;
    }
  }

  async deleteMessage(messageId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.DELETE_MESSAGE.replace(':messageId', messageId);
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  async editMessage(messageId, newContent) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EDIT_MESSAGE.replace(':messageId', messageId);
      const response = await api.patch(endpoint, { content: newContent });
      return response.data;
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }

  async searchMessages(query, conversationId = null) {
    try {
      const params = new URLSearchParams({ query });
      if (conversationId) {
        params.append('conversationId', conversationId);
      }
      
      const response = await api.get(`${API_CONFIG.ENDPOINTS.SEARCH_MESSAGES}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.GET_UNREAD_COUNT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  }
}

// Create singleton instance
const parentService = new ParentService();

// Export both the class and the singleton instance
export { ParentService, parentService };
export default parentService;

