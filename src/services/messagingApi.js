import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

// Young Eagles Messaging API Service
class MessagingAPI {
  constructor() {
    this.baseURL = API_CONFIG.getApiUrl();
    this.socket = null;
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialize socket connection and authentication
  async initialize(userId, userRole) {
    try {
      console.log(`🔄 Initializing MessagingAPI for user ${userId} (${userRole})`);
      
      // Initialize Socket.IO for real-time updates
      this.socket = io(this.baseURL, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        withCredentials: true,
        timeout: 10000
      });

      // Setup socket event listeners
      this.socket.on('connect', () => {
        console.log('✅ Socket connected to messaging service');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected from messaging service');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ Socket connection error:', error);
      });

      // Listen for user-specific events
      this.socket.on(`user_${userRole}_${userId}`, (data) => {
        console.log('📨 Real-time message received:', data);
        this.emit(data.type, data);
      });

      // Listen for general message events
      this.socket.on('new_message', (data) => {
        console.log('📨 New message event:', data);
        this.emit('new_message', data);
      });

      this.socket.on('new_conversation', (data) => {
        console.log('💬 New conversation event:', data);
        this.emit('new_conversation', data);
      });

      this.isInitialized = true;
      console.log('✅ Messaging API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize messaging service:', error);
      // Continue without socket - API will still work
    }
  }

  // Helper to make authenticated API requests
  async apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('⚠️ No authentication token found');
      throw new Error('Authentication required');
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`🌐 API Request: ${config.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Handle authentication errors gracefully
      if (response.status === 401) {
        console.warn('🔐 Authentication failed for messaging API');
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error(data.message || `API request failed: ${response.status}`);
      }
      
      console.log(`✅ API Success: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all conversations for the current user
  async getConversations() {
    try {
      const data = await this.apiRequest('/api/messaging/conversations');
      return {
        success: true,
        conversations: data.conversations || [],
        count: data.count || 0
      };
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      return {
        success: false,
        conversations: [],
        count: 0,
        error: error.message
      };
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const data = await this.apiRequest(
        `/api/messaging/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        messages: data.messages || [],
        pagination: data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return {
        success: false,
        messages: [],
        pagination: {},
        error: error.message
      };
    }
  }

  // Send a message in an existing conversation
  async sendMessage(conversationId, content, messageType = 'text', attachmentUrl = null) {
    try {
      const data = await this.apiRequest(
        `/api/messaging/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            content,
            messageType,
            attachmentUrl
          })
        }
      );
      return {
        success: true,
        messageId: data.messageId,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Start a new conversation
  async startConversation(recipientId, recipientType, subject, messageContent) {
    try {
      const data = await this.apiRequest('/api/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify({
          recipientId,
          recipientType,
          subject,
          messageContent
        })
      });
      return {
        success: true,
        conversationId: data.conversationId,
        messageId: data.messageId,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available contacts
  async getContacts() {
    try {
      const data = await this.apiRequest('/api/messaging/contacts');
      return {
        success: true,
        contacts: data.contacts || []
      };
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      return {
        success: false,
        contacts: [],
        error: error.message
      };
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const data = await this.apiRequest('/api/messaging/unread-count');
      return {
        success: true,
        unread_count: data.unread_count || 0
      };
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return {
        success: false,
        unread_count: 0,
        error: error.message
      };
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId) {
    try {
      const data = await this.apiRequest(
        `/api/messaging/conversations/${conversationId}/read`,
        {
          method: 'PATCH'
        }
      );
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send broadcast message (admin only)
  async sendBroadcast(subject, content, recipientType, className = null) {
    try {
      const data = await this.apiRequest('/api/messaging/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          content,
          recipientType,
          className
        })
      });
      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error sending broadcast:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send real-time message via socket (if available)
  sendRealtimeMessage(conversationId, content) {
    if (this.socket && this.socket.connected) {
      console.log('📤 Sending real-time message via socket');
      this.socket.emit('send_message', {
        conversationId,
        content,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    console.warn('⚠️ Socket not available for real-time messaging');
    return false;
  }

  // Join conversation room for real-time updates
  joinConversation(conversationId) {
    if (this.socket && this.socket.connected) {
      console.log(`🏠 Joining conversation room: ${conversationId}`);
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.socket.connected) {
      console.log(`🚪 Leaving conversation room: ${conversationId}`);
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Event system for real-time updates
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in messaging event listener:', error);
        }
      });
    }
  }

  // Get connection status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      socketConnected: this.socket?.connected || false,
      socketId: this.socket?.id || null
    };
  }

  // Cleanup socket connection
  disconnect() {
    console.log('🧹 Disconnecting messaging API');
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
const messagingAPI = new MessagingAPI();
export default messagingAPI;
