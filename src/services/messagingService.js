import { API_CONFIG } from '../config/api.js';
import parentService from './parentService.js';
import websocketService from './websocketService.js';
import { showTopNotification } from '../components/TopNotificationManager.js';

class MessagingService {
  constructor() {
    this.conversations = new Map();
    this.messageCache = new Map();
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialize the messaging service
  async initialize(userId, userRole) {
    if (this.isInitialized) return;
    
    console.log('🔄 Initializing MessagingService...');
    
    try {
      // Connect WebSocket
      websocketService.connect(userId, userRole);
      
      // Setup WebSocket listeners for conversation updates
      this.setupWebSocketListeners();
      
      // Load initial conversations
      await this.loadConversations();
      
      this.isInitialized = true;
      console.log('✅ MessagingService initialized successfully');
      
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MessagingService:', error);
      throw error;
    }
  }

  // Setup WebSocket event listeners
  setupWebSocketListeners() {
    websocketService.on('newMessage', (message) => {
      this.handleNewMessage(message);
    });

    websocketService.on('conversationUpdated', (conversation) => {
      this.handleConversationUpdate(conversation);
    });

    websocketService.on('messageDelivered', (messageData) => {
      this.handleMessageDelivered(messageData);
    });

    websocketService.on('messageRead', (messageData) => {
      this.handleMessageRead(messageData);
    });
  }

  // Load all conversations for the user
  async loadConversations() {
    try {
      console.log('📥 Loading conversations...');
      const conversations = await parentService.getConversations();
      
      // Store conversations in cache
      conversations.forEach(conversation => {
        this.conversations.set(conversation.id, {
          ...conversation,
          messages: [],
          lastLoaded: null,
          hasMoreMessages: true
        });
      });
      
      console.log(`📥 Loaded ${conversations.length} conversations`);
      this.emit('conversationsLoaded', Array.from(this.conversations.values()));
      
      return Array.from(this.conversations.values());
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      throw error;
    }
  }

  // Get all conversations
  getConversations() {
    return Array.from(this.conversations.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.updatedAt).getTime();
      const timeB = new Date(b.lastMessageTime || b.updatedAt).getTime();
      return timeB - timeA; // Most recent first
    });
  }

  // Get a specific conversation by ID
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  // Load messages for a conversation
  async loadMessages(conversationId, page = 1, limit = 50) {
    try {
      const conversation = this.conversations.get(conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      console.log(`📥 Loading messages for conversation ${conversationId}, page ${page}`);
      
      const messageHistory = await parentService.getMessageHistory(conversationId, page, limit);
      
      // Update conversation with new messages
      if (page === 1) {
        // Replace messages for first page
        conversation.messages = messageHistory.messages || [];
      } else {
        // Prepend older messages for pagination
        conversation.messages = [...(messageHistory.messages || []), ...conversation.messages];
      }
      
      conversation.lastLoaded = new Date().toISOString();
      conversation.hasMoreMessages = (messageHistory.messages?.length || 0) === limit;
      
      // Cache messages
      (messageHistory.messages || []).forEach(message => {
        this.messageCache.set(message.id, message);
      });
      
      this.emit('messagesLoaded', {
        conversationId,
        messages: conversation.messages,
        hasMore: conversation.hasMoreMessages
      });
      
      return conversation.messages;
    } catch (error) {
      console.error(`❌ Failed to load messages for conversation ${conversationId}:`, error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(conversationId, content, attachments = []) {
    try {
      const conversation = this.conversations.get(conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      const tempMessage = {
        id: `temp_${Date.now()}`,
        conversationId,
        content,
        attachments,
        senderId: parseInt(localStorage.getItem('userId') || '0'),
        senderName: localStorage.getItem('userName') || 'You',
        createdAt: new Date().toISOString(),
        status: 'sending',
        isTemporary: true
      };

      // Add to conversation immediately for instant feedback
      conversation.messages.push(tempMessage);
      conversation.lastMessage = content;
      conversation.lastMessageTime = tempMessage.createdAt;
      
      this.emit('messageAdded', { conversationId, message: tempMessage });

      try {
        // Send via WebSocket if connected
        if (websocketService.isConnected) {
          websocketService.sendMessage(conversationId, content, attachments);
          
          // Update status to sent (will be confirmed by server)
          tempMessage.status = 'sent';
          this.emit('messageUpdated', { conversationId, message: tempMessage });
          
        } else {
          // Fallback to REST API
          const result = await parentService.sendMessage({
            conversationId,
            content,
            attachments
          });
          
          // Replace temp message with server response
          const messageIndex = conversation.messages.findIndex(m => m.id === tempMessage.id);
          if (messageIndex > -1) {
            conversation.messages[messageIndex] = {
              ...result,
              status: 'sent'
            };
            this.messageCache.set(result.id, result);
          }
          
          this.emit('messageUpdated', { conversationId, message: result });
        }
        
        return tempMessage;
        
      } catch (error) {
        // Mark message as failed
        tempMessage.status = 'failed';
        this.emit('messageUpdated', { conversationId, message: tempMessage });
        throw error;
      }
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      showTopNotification('Failed to send message', 'error');
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(participants, initialMessage = null) {
    try {
      console.log('🆕 Creating new conversation with participants:', participants);
      
      const conversation = await parentService.createConversation(participants, initialMessage);
      
      // Add to cache
      this.conversations.set(conversation.id, {
        ...conversation,
        messages: [],
        lastLoaded: null,
        hasMoreMessages: false
      });
      
      this.emit('conversationCreated', conversation);
      showTopNotification('New conversation created', 'success');
      
      return conversation;
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      showTopNotification('Failed to create conversation', 'error');
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      await parentService.markMessageAsRead(messageId);
      
      // Update local cache
      const message = this.messageCache.get(messageId);
      if (message) {
        message.isRead = true;
        this.emit('messageRead', { messageId, message });
      }
      
      // Also send via WebSocket for real-time updates
      websocketService.markMessageAsRead(messageId);
      
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
    }
  }

  // Search messages across conversations
  async searchMessages(query, conversationId = null) {
    try {
      console.log(`🔍 Searching messages: "${query}"`);
      
      const results = await parentService.searchMessages(query, conversationId);
      
      this.emit('searchResults', { query, results });
      
      return results;
    } catch (error) {
      console.error('❌ Failed to search messages:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const result = await parentService.getUnreadCount();
      
      this.emit('unreadCountUpdated', result);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return { total: 0, byConversation: {} };
    }
  }

  // Upload attachment
  async uploadAttachment(file, conversationId) {
    try {
      console.log(`📎 Uploading attachment: ${file.name}`);
      
      const result = await parentService.uploadMessageAttachment(file, conversationId);
      
      showTopNotification(`Attachment "${file.name}" uploaded`, 'success');
      
      return result;
    } catch (error) {
      console.error('❌ Failed to upload attachment:', error);
      showTopNotification(`Failed to upload "${file.name}"`, 'error');
      throw error;
    }
  }

  // Handle incoming WebSocket messages
  handleNewMessage(message) {
    console.log('📨 Handling new message via MessagingService:', message);
    
    const conversationId = message.conversationId;
    const conversation = this.conversations.get(conversationId);
    
    if (conversation) {
      // Check for duplicates
      const exists = conversation.messages.some(m => m.id === message.id);
      if (!exists) {
        conversation.messages.push(message);
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.createdAt;
        
        // Update cache
        this.messageCache.set(message.id, message);
        
        this.emit('newMessage', { conversationId, message });
      }
    } else {
      // Load conversation if not in cache
      this.loadConversationById(conversationId);
    }
  }

  // Handle conversation updates
  handleConversationUpdate(conversation) {
    console.log('🔄 Handling conversation update:', conversation);
    
    this.conversations.set(conversation.id, {
      ...this.conversations.get(conversation.id),
      ...conversation
    });
    
    this.emit('conversationUpdated', conversation);
  }

  // Handle message delivery confirmation
  handleMessageDelivered(messageData) {
    const message = this.messageCache.get(messageData.messageId);
    if (message) {
      message.status = 'delivered';
      this.emit('messageDelivered', messageData);
    }
  }

  // Handle message read confirmation
  handleMessageRead(messageData) {
    const message = this.messageCache.get(messageData.messageId);
    if (message) {
      message.isRead = true;
      this.emit('messageRead', messageData);
    }
  }

  // Load a specific conversation by ID
  async loadConversationById(conversationId) {
    try {
      const conversation = await parentService.getConversation(conversationId);
      
      this.conversations.set(conversationId, {
        ...conversation,
        messages: [],
        lastLoaded: null,
        hasMoreMessages: true
      });
      
      this.emit('conversationLoaded', conversation);
      
      return conversation;
    } catch (error) {
      console.error(`❌ Failed to load conversation ${conversationId}:`, error);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in MessagingService listener for ${event}:`, error);
        }
      });
    }
  }

  // Cleanup
  cleanup() {
    console.log('🧹 Cleaning up MessagingService...');
    
    this.conversations.clear();
    this.messageCache.clear();
    this.listeners.clear();
    this.isInitialized = false;
    
    websocketService.disconnect();
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      conversationCount: this.conversations.size,
      cachedMessages: this.messageCache.size,
      websocketConnected: websocketService.isConnected
    };
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export default messagingService; 