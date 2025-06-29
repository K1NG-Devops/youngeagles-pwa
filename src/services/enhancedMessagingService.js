import io from 'socket.io-client';
import httpClient from './httpClient';

class EnhancedMessagingService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.eventListeners = new Map();
    this.presenceData = new Map();
    this.typingIndicators = new Map();
    this.messageStatuses = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Check if enhanced messaging endpoints are available on the server
  async checkEnhancedMessagingAvailability() {
    try {
      const response = await httpClient.get('/api/messaging-enhanced/status');
      return response.data.available === true;
    } catch (error) {
      // If endpoint doesn't exist, enhanced messaging is not available
      if (error.response?.status === 404) {
        return false;
      }
      // For other errors, log and assume not available
      console.warn('Failed to check enhanced messaging availability:', error.message);
      return false;
    }
  }

  // Initialize WebSocket connection
  async initialize(user) {
    this.currentUser = user;
    
    try {
      // First check if enhanced messaging endpoints are available
      const isEnhancedMessagingAvailable = await this.checkEnhancedMessagingAvailability();
      
      if (!isEnhancedMessagingAvailable) {
        console.log('⚠️ Enhanced messaging not available on server, running in basic mode');
        this.isConnected = true; // Mark as connected for basic functionality
        return true;
      }
      
      // Connect to WebSocket server
      // Determine WebSocket URL based on environment
      let wsUrl;
      
      if (import.meta.env.VITE_FORCE_LOCAL_API === 'true') {
        // Development mode - use local WebSocket server
        wsUrl = import.meta.env.VITE_WS_LOCAL_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
      } else {
        // Production mode - use production WebSocket server
        wsUrl = import.meta.env.VITE_API_WS_URL || import.meta.env.VITE_API_BASE_URL || 'https://youngeagles-api-server.up.railway.app';
      }
      
      console.log(`🔌 Attempting to connect to WebSocket server: ${wsUrl}`);
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000, // Reduced timeout
        forceNew: true
      });

      this.setupEventListeners();
      
      // Try to authenticate with timeout
      try {
        await this.authenticate();
        console.log('🚀 Enhanced messaging service initialized with WebSocket');
      } catch (authError) {
        console.warn('⚠️ WebSocket authentication failed, falling back to HTTP mode:', authError.message);
        this.disconnect(); // Clean up socket
        this.isConnected = true; // Mark as connected for basic functionality
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize enhanced messaging:', error);
      console.log('🔄 Falling back to basic messaging mode');
      this.isConnected = true; // Mark as connected for basic functionality
      return true; // Still return true to allow basic functionality
    }
  }

  // Authenticate with WebSocket server
  authenticate() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.currentUser) {
        reject(new Error('Socket or user not available'));
        return;
      }

      this.socket.emit('authenticate', {
        userId: this.currentUser.id,
        userType: this.currentUser.role,
        token: localStorage.getItem('accessToken') || localStorage.getItem('token')
      });

      this.socket.once('authenticated', (data) => {
        console.log('✅ WebSocket authenticated:', data);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve(data);
      });

      this.socket.once('authError', (error) => {
        console.error('❌ WebSocket authentication failed:', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Authentication timeout'));
        }
      }, 10000);
    });
  }

  // Setup WebSocket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      if (this.currentUser) {
        this.authenticate().catch(console.error);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      this.isConnected = false;
      this.attemptReconnect();
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 WebSocket reconnected');
      this.reconnectAttempts = 0;
    });

    // Enhanced messaging events
    this.socket.on('presenceUpdate', (data) => {
      this.handlePresenceUpdate(data);
    });

    this.socket.on('userTyping', (data) => {
      this.handleTypingIndicator(data);
    });

    this.socket.on('messageRead', (data) => {
      this.handleMessageRead(data);
    });

    this.socket.on('messageDelivered', (data) => {
      this.handleMessageDelivered(data);
    });

    this.socket.on('reactionAdded', (data) => {
      this.handleReactionAdded(data);
    });

    this.socket.on('newMessageReceived', (data) => {
      this.handleNewMessageReceived(data);
    });
  }

  // Handle presence updates
  handlePresenceUpdate(data) {
    const userKey = `${data.userType}_${data.userId}`;
    this.presenceData.set(userKey, {
      status: data.status,
      lastSeen: data.lastSeen
    });

    this.emit('presenceUpdate', data);
    console.log(`🟢 Presence updated: ${data.userName} is ${data.status}`);
  }

  // Handle typing indicators
  handleTypingIndicator(data) {
    if (data.isTyping) {
      this.typingIndicators.set(data.conversationId, {
        userId: data.userId,
        userType: data.userType,
        userName: data.userName || 'Someone',
        startedAt: new Date()
      });

      // Auto-clear typing indicator after 15 seconds
      setTimeout(() => {
        this.typingIndicators.delete(data.conversationId);
        this.emit('typingUpdate', { conversationId: data.conversationId, isTyping: false });
      }, 15000);
    } else {
      this.typingIndicators.delete(data.conversationId);
    }

    this.emit('typingUpdate', data);
  }

  // Handle message read receipts
  handleMessageRead(data) {
    this.messageStatuses.set(data.messageId, 'read');
    this.emit('messageStatusUpdate', {
      messageId: data.messageId,
      status: 'read',
      readBy: data.readBy,
      readAt: data.readAt
    });
  }

  // Handle message delivery confirmations
  handleMessageDelivered(data) {
    this.messageStatuses.set(data.messageId, 'delivered');
    this.emit('messageStatusUpdate', {
      messageId: data.messageId,
      status: 'delivered',
      deliveredAt: data.deliveredAt
    });
  }

  // Handle reaction additions
  handleReactionAdded(data) {
    this.emit('reactionAdded', data);
  }

  // Handle new message received
  handleNewMessageReceived(data) {
    this.emit('newMessageReceived', data);
    
    // Auto-mark as delivered if user is active
    if (document.visibilityState === 'visible') {
      this.markMessageAsDelivered(data.messageId);
    }
  }

  // Send enhanced message (with fallback to regular messaging)
  async sendEnhancedMessage(messageData) {
    try {
      const response = await httpClient.post('/api/messaging-enhanced/send-enhanced', {
        recipient_id: messageData.recipientId,
        recipient_type: messageData.recipientType,
        message: messageData.message,
        subject: messageData.subject || 'Chat Message',
        message_priority: messageData.priority || 'normal',
        reply_to_message_id: messageData.replyToMessageId || null,
        attachment_type: messageData.attachmentType || null
      });

      if (response.data.success) {
        // Notify WebSocket about new message for real-time delivery tracking
        this.socket?.emit('newMessage', {
          messageId: response.data.messageId,
          recipientId: messageData.recipientId,
          recipientType: messageData.recipientType,
          conversationId: `${messageData.recipientId}_${messageData.recipientType}`
        });

        console.log('📨 Enhanced message sent:', response.data.messageId);
        return response.data;
      }
    } catch (error) {
      // Fall back to regular messaging API
      console.log('⬇️ Falling back to regular messaging API for sending');
      return await this.sendRegularMessage(messageData);
    }
  }

  // Fallback to regular messaging API for sending
  async sendRegularMessage(messageData) {
    try {
      const response = await httpClient.post('/api/messaging/send', {
        recipient_id: messageData.recipientId,
        recipient_type: messageData.recipientType,
        message: messageData.message,
        subject: messageData.subject || 'Chat Message'
      });

      if (response.data.success) {
        console.log('📨 Regular message sent:', response.data.messageId);
        return {
          success: true,
          messageId: response.data.messageId,
          message: 'Message sent successfully'
        };
      }
    } catch (error) {
      console.error('❌ Failed to send regular message:', error);
      throw error;
    }
  }

  // Get enhanced conversations (with fallback to regular messaging)
  async getEnhancedConversations() {
    try {
      const response = await httpClient.get('/api/messaging-enhanced/conversations-enhanced');
      
      if (response.data.success) {
        // Update presence data from conversations
        response.data.conversations.forEach(conv => {
          const userKey = `${conv.otherParticipant.type}_${conv.otherParticipant.id}`;
          this.presenceData.set(userKey, {
            status: conv.otherParticipant.presenceStatus,
            lastSeen: conv.otherParticipant.lastSeen
          });
        });

        return response.data.conversations;
      }
    } catch (error) {
      // Fall back to regular messaging API if enhanced messaging is not available
      console.log('⬇️ Falling back to regular conversations API');
      return await this.getRegularConversations();
    }
  }

  // Fallback to regular conversations API
  async getRegularConversations() {
    try {
      const response = await httpClient.get('/api/messaging/conversations');
      
      if (response.data.success) {
        // Transform regular conversations to enhanced format
        const conversations = response.data.conversations.map(conv => ({
          id: conv.id,
          otherParticipant: {
            id: conv.other_participant_id,
            type: conv.other_participant_type,
            name: conv.other_participant_name,
            avatar: conv.other_participant_avatar,
            presenceStatus: 'offline', // Default for regular messaging
            lastSeen: null
          },
          lastMessage: {
            id: conv.last_message_id,
            message: conv.last_message,
            createdAt: conv.last_message_time,
            senderId: conv.last_message_sender_id,
            senderType: conv.last_message_sender_type
          },
          unreadCount: conv.unread_count || 0,
          updatedAt: conv.updated_at
        }));
        
        return conversations;
      }
    } catch (error) {
      console.error('❌ Failed to get regular conversations:', error);
      throw error;
    }
  }

  // Get enhanced messages for conversation (with fallback)
  async getEnhancedMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await httpClient.get(
        `/api/messaging-enhanced/conversations/${conversationId}/messages-enhanced?page=${page}&limit=${limit}`
      );
      
      if (response.data.success) {
        // Update message statuses
        response.data.messages.forEach(msg => {
          if (msg.message_status) {
            this.messageStatuses.set(msg.id, msg.message_status);
          }
        });

        return response.data.messages;
      }
    } catch (error) {
      // Fall back to regular messages API
      console.log('⬇️ Falling back to regular messages API');
      return await this.getRegularMessages(conversationId, page, limit);
    }
  }

  // Fallback to regular messages API
  async getRegularMessages(conversationId, page = 1, limit = 50) {
    try {
      // Parse conversation ID to get recipient info
      const [recipientId, recipientType] = conversationId.split('_');
      
      const response = await httpClient.get(
        `/api/messaging/messages?recipient_id=${recipientId}&recipient_type=${recipientType}&page=${page}&limit=${limit}`
      );
      
      if (response.data.success) {
        // Transform regular messages to enhanced format
        const messages = response.data.messages.map(msg => ({
          id: msg.id,
          message: msg.message,
          sender_id: msg.sender_id,
          sender_type: msg.sender_type,
          recipient_id: msg.recipient_id,
          recipient_type: msg.recipient_type,
          message_status: 'read', // Default for regular messaging
          message_priority: 'normal',
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          reactions: [], // Empty for regular messaging
          reply_to_message_id: null
        }));
        
        return messages;
      }
    } catch (error) {
      console.error('❌ Failed to get regular messages:', error);
      throw error;
    }
  }

  // Add reaction to message
  async addReaction(messageId, emoji) {
    try {
      const response = await httpClient.post(`/api/messaging-enhanced/messages/${messageId}/reactions`, {
        emoji
      });

      if (response.data.success) {
        // Emit WebSocket event for real-time updates
        this.socket?.emit('addReaction', { messageId, emoji });
        console.log(`😊 Reaction added: ${emoji} to message ${messageId}`);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to add reaction:', error);
      throw error;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId, emoji) {
    try {
      const response = await httpClient.delete(`/api/messaging-enhanced/messages/${messageId}/reactions`, {
        data: { emoji }
      });

      if (response.data.success) {
        console.log(`🗑️ Reaction removed: ${emoji} from message ${messageId}`);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to remove reaction:', error);
      throw error;
    }
  }

  // Update user presence status
  async updatePresence(status, deviceInfo = null) {
    try {
      const response = await httpClient.post('/api/messaging-enhanced/presence', {
        status,
        deviceInfo: deviceInfo || navigator.userAgent
      });

      if (response.data.success) {
        // Also emit via WebSocket for real-time updates
        this.socket?.emit('updateStatus', { status });
        console.log(`🟢 Presence updated to: ${status}`);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to update presence:', error);
      throw error;
    }
  }

  // Start typing indicator
  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('startTyping', { conversationId });
    }
  }

  // Stop typing indicator
  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stopTyping', { conversationId });
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId, senderId = null, senderType = null) {
    try {
      const response = await httpClient.patch(`/api/messaging-enhanced/messages/${messageId}/read`);
      
      if (response.data.success) {
        // Emit WebSocket event for read receipt
        this.socket?.emit('markAsRead', {
          messageId,
          senderId,
          senderType
        });

        this.messageStatuses.set(messageId, 'read');
        console.log(`✅ Message ${messageId} marked as read`);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
      throw error;
    }
  }

  // Mark message as delivered (internal)
  markMessageAsDelivered(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('messageDelivered', { messageId });
    }
  }

  // Search messages (with fallback)
  async searchMessages(query, limit = 20, offset = 0) {
    try {
      const response = await httpClient.get('/api/messaging-enhanced/search', {
        params: { q: query, limit, offset }
      });
      
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      // Fall back to basic search (return empty results for now)
      console.log('⬇️ Enhanced search not available, falling back to basic search');
      return {
        success: true,
        messages: [],
        total: 0,
        query: query,
        message: 'Search functionality not available in basic mode'
      };
    }
  }

  // Get user presence
  getUserPresence(userId, userType) {
    const userKey = `${userType}_${userId}`;
    return this.presenceData.get(userKey) || { status: 'offline', lastSeen: null };
  }

  // Get typing indicator for conversation
  getTypingIndicator(conversationId) {
    return this.typingIndicators.get(conversationId) || null;
  }

  // Get message status
  getMessageStatus(messageId) {
    return this.messageStatuses.get(messageId) || 'sent';
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinConversation', { conversationId });
    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveConversation', { conversationId });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Reconnection logic
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
    this.presenceData.clear();
    this.typingIndicators.clear();
    this.messageStatuses.clear();
    console.log('🔌 Enhanced messaging service disconnected');
  }

  // Heartbeat to maintain connection
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create singleton instance
const enhancedMessagingService = new EnhancedMessagingService();

export default enhancedMessagingService; 