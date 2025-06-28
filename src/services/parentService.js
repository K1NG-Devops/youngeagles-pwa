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
      
      // Use the correct API endpoint that exists in the backend
      const response = await api.get(`/api/homework/parent/${parentId}/child/${childId}`, {
        headers: {
          'X-Request-Source': 'pwa-parent-homework',
          'Cache-Control': 'no-cache',
        },
      });

      console.log(`✅ SUCCESS! Homework fetched successfully:`, response.data);
      
      // Handle the response structure from the API
      let homeworkData = [];
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          // New API format: {success: true, data: [...], child: {...}, total_count: n}
          homeworkData = response.data.data.map(hw => ({
            ...hw,
            submission_at: hw.submitted_at, // Map submitted_at to submission_at for consistency
            submission: hw.submitted ? { status: 'submitted' } : null
          }));
        } else if (response.data.success && Array.isArray(response.data.homework)) {
          // Legacy API format: {success: true, homework: [...], child: {...}, total: n}
          homeworkData = response.data.homework.map(hw => ({
            ...hw,
            submission_at: hw.submitted_at,
            submission: hw.status === 'submitted' ? { status: 'submitted' } : null
          }));
        } else if (Array.isArray(response.data.homework)) {
          // Direct homework array format
          homeworkData = response.data.homework.map(hw => ({
            ...hw,
            submission_at: hw.submitted_at,
            submission: hw.status === 'submitted' ? { status: 'submitted' } : null
          }));
        } else if (Array.isArray(response.data)) {
          // Direct array format
          homeworkData = response.data.map(hw => ({
            ...hw,
            submission_at: hw.submitted_at,
            submission: hw.status === 'submitted' ? { status: 'submitted' } : null
          }));
        }
      }
      
      console.log(`ParentService: Processed homework data:`, homeworkData);
      return {
        success: true,
        data: homeworkData
      };
    } catch (error) {
      console.error(`❌ Error fetching homework:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {
          homework: [],
          total: 0,
          child: null
        }
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
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.MESSAGES);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔐 Authentication failed for messages endpoint');
        // Don't re-throw auth errors to prevent redirect loops
        return { messages: [], error: 'AUTHENTICATION_FAILED' };
      }
      
      // For other errors, return empty structure
      return { messages: [], error: error.message };
    }
  }

  // Send message
  async sendMessage(messageData) {
    try {
      console.log('💬 Sending message with data:', messageData);
      
      // Transform the data to match backend expectations
      const backendData = {
        recipient_id: messageData.recipientId || messageData.recipient_id,
        recipient_type: messageData.recipientType || messageData.recipient_type,
        message: messageData.message || messageData.content,
        subject: messageData.subject || 'Message'
      };
      
      console.log('🔄 Transformed data for backend:', backendData);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.SEND_MESSAGE, backendData);
      console.log('✅ Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get available contacts (teachers, admins)
  async getAvailableContacts() {
    try {
      console.log('🔍 Fetching available contacts from:', API_CONFIG.ENDPOINTS.GET_CONTACTS);
      const response = await api.get(API_CONFIG.ENDPOINTS.GET_CONTACTS); 
      console.log('✅ Contacts API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch available contacts:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔐 Authentication failed for contacts endpoint');
        // Don't re-throw auth errors to prevent redirect loops
        return { contacts: [], error: 'AUTHENTICATION_FAILED' };
      }
      
      // For other errors, return empty structure
      return { contacts: [], error: error.message };
    }
  }

  async getConversations() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.GET_CONVERSATIONS);
      return response.data.conversations || [];
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.log('🔐 Authentication failed for conversations endpoint');
        return { conversations: [], error: 'AUTHENTICATION_FAILED' };
      }
      
      // Handle specific database errors
      if (error.response?.status === 500 && error.response?.data?.error === 'DATABASE_ERROR') {
        console.warn('🗄️ Database connection issue detected for conversations');
        return { conversations: [], error: 'DATABASE_ERROR', fallbackMode: true };
      }
      
      // Handle schema errors (missing columns)
      if (error.response?.status === 500 && error.message?.includes('Unknown column')) {
        console.warn('🗄️ Database schema issue detected for conversations - missing columns');
        return { conversations: [], error: 'SCHEMA_ERROR', fallbackMode: true };
      }
      
      // For other errors, return empty structure instead of throwing
      console.warn('💡 Conversations endpoint not available, falling back to contacts only');
      return { conversations: [], error: error.message, fallbackMode: true };
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

  async createConversation(recipientId, recipientType, subject, messageContent) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CREATE_CONVERSATION, {
        recipientId,
        recipientType,
        subject,
        messageContent
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
      console.log('🔄 Fetching message history for conversation:', conversationId);
      const endpoint = API_CONFIG.ENDPOINTS.GET_CONVERSATION_MESSAGES.replace(':conversationId', conversationId);
      const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
      console.log('✅ Message history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch message history:', error);
      // Return empty messages array instead of throwing
      return { messages: [], error: error.message };
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

  async sendMessageToConversation(conversationId, content, messageType = 'text', attachmentUrl = null) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.SEND_CONVERSATION_MESSAGE.replace(':conversationId', conversationId);
      const response = await api.post(endpoint, {
        content,
        messageType,
        attachmentUrl
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message to conversation:', error);
      throw error;
    }
  }
}

// Create singleton instance
const parentService = new ParentService();

// Export both the class and the singleton instance
export { ParentService };
export default parentService;

