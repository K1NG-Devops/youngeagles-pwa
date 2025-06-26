import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api.js';
import { showTopNotification } from '../components/TopNotificationManager.jsx';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.userId = null;
    this.role = null;
    this.reconnectTimer = null;
    this.lastConnectedTime = null;
    this.isConnecting = false;
  }

  connect(userId, role) {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('🔄 Already attempting to connect...');
      return;
    }

    // If already connected with same user, don't reconnect
    if (this.isConnected && this.socket && this.userId === userId && this.role === role) {
      console.log('✅ Already connected with correct user');
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    this.role = role;

    const socketUrl = API_CONFIG.WEBSOCKET.getUrl();
    console.log('🔌 Connecting to WebSocket at:', socketUrl);
    
    try {
      // Clear any existing reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Get current auth token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('⚠️ No access token available for WebSocket connection');
        this.isConnecting = false;
        return;
      }

      // Disconnect existing socket if any
      if (this.socket) {
        console.log('🔄 Disconnecting existing socket before reconnecting...');
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(socketUrl, {
        path: API_CONFIG.WEBSOCKET.PATH,
        query: { userId, role },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
        auth: {
          token: token
        }
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  setupEventListeners() {
    if (!this.socket) {
      console.error('❌ Cannot setup listeners: Socket not initialized');
      return;
    }

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected with ID:', this.socket.id);
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.lastConnectedTime = Date.now();
      this.notifyListeners('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected. Reason:', reason);
      this.isConnected = false;
      this.isConnecting = false;
      this.notifyListeners('disconnected', { reason });
      
      // Only reconnect if we have user info and it wasn't a manual disconnect
      if (this.userId && this.role && reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.notifyListeners('error', { error: 'Max reconnection attempts reached' });
      }
      
      this.notifyListeners('error', { error: error.message });
      this.scheduleReconnect();
    });

    // Message Events
    this.socket.on('message', (message) => {
      console.log('📨 Generic message received:', message);
      this.notifyListeners('message', message);
    });

    this.socket.on('new_message', (message) => {
      console.log('📨 New chat message received:', message);
      this.notifyListeners('new_message', message);
      
      // Show notification if message is not from current user
      if (message.senderId !== this.userId) {
        showTopNotification(`New message from ${message.senderName || 'Someone'}`, 'info');
      }
    });

    // Typing Indicators
    this.socket.on('user_typing', (data) => {
      this.notifyListeners('typing', data);
    });

    // System Notifications
    this.socket.on('notification', (notification) => {
      console.log('🔔 System notification received:', notification);
      this.notifyListeners('notification', notification);
      showTopNotification(notification.message, notification.type || 'info');
    });

    // Error Events
    this.socket.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
      showTopNotification('Messaging service error', 'error');
      this.notifyListeners('error', error);
      this.scheduleReconnect();
    });
  }

  scheduleReconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Calculate delay based on attempts (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30 seconds

    this.reconnectTimer = setTimeout(() => {
      console.log(`🔄 Attempting reconnect after ${delay}ms delay...`);
      if (this.userId && this.role) {
        this.connect(this.userId, this.role);
      }
    }, delay);
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => this.unsubscribe(event, callback); // Return cleanup function
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  sendMessage(message) {
    if (!this.isConnected || !this.socket) {
      showTopNotification('Cannot send message: Not connected to messaging service', 'error');
      return false;
    }

    try {
      this.socket.emit('send_message', {
        ...message,
        senderId: this.userId,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      showTopNotification('Failed to send message', 'error');
      return false;
    }
  }

  sendTyping(conversationId, isTyping = true) {
    if (!this.isConnected || !this.socket) return false;
    
    try {
      this.socket.emit('user_typing', {
        conversationId,
        userId: this.userId,
        typing: isTyping,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
      return false;
    }
  }

  joinConversation(conversationId) {
    if (!this.isConnected || !this.socket) return false;
    
    try {
      this.socket.emit('join_conversation', { 
        conversationId,
        userId: this.userId
      });
      console.log('🔗 Joining conversation:', conversationId);
      return true;
    } catch (error) {
      console.error('Failed to join conversation:', error);
      return false;
    }
  }

  leaveConversation(conversationId) {
    if (!this.isConnected || !this.socket) return false;
    
    try {
      this.socket.emit('leave_conversation', { 
        conversationId,
        userId: this.userId
      });
      console.log('🔗 Leaving conversation:', conversationId);
      return true;
    } catch (error) {
      console.error('Failed to leave conversation:', error);
      return false;
    }
  }

  reconnect() {
    if (this.userId && this.role) {
      console.log('🔄 Attempting to reconnect...');
      this.connect(this.userId, this.role);
    } else {
      console.error('❌ Cannot reconnect: Missing user information');
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.userId = null;
      this.role = null;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService; 