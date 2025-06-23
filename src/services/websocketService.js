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
  }

  connect(userId, role) {
    if (this.socket) {
      this.disconnect();
    }

    const socketUrl = API_CONFIG.BASE_URL;
    
    this.socket = io(socketUrl, {
      path: '/socket.io/',
      query: { userId, role },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      showTopNotification('Connected to messaging service', 'success');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      this.isConnected = false;
      showTopNotification('Disconnected from messaging service', 'error');
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO connection error:', error);
      this.reconnectAttempts++;
      showTopNotification('Connection error. Retrying...', 'error');
    });

    this.socket.on('message', (message) => {
      this.notifyListeners('message', message);
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Socket.IO authenticated:', data);
      this.notifyListeners('connected', data);
    });

    this.socket.on('new_message', (message) => {
      console.log('📨 New message received:', message);
      this.notifyListeners('new_message', message);
    });

    this.socket.on('user_typing', (data) => {
      this.notifyListeners('typing', data);
    });

    this.socket.on('notification', (notification) => {
      console.log('🔔 Notification received:', notification);
      this.notifyListeners('notification', notification);
      showTopNotification(notification.message, notification.type || 'info');
    });
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  sendMessage(message) {
    if (!this.isConnected) {
      showTopNotification('Not connected to messaging service', 'error');
      return false;
    }

    this.socket.emit('send_message', message);
    return true;
  }

  sendTyping(conversationId, isTyping = true) {
    if (!this.isConnected) return false;
    
    this.socket.emit('user_typing', {
      conversationId,
      typing: isTyping,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  joinConversation(conversationId) {
    if (!this.isConnected) return false;
    
    this.socket.emit('join_conversation', { conversationId });
    console.log('🔗 Joining conversation:', conversationId);
    return true;
  }

  leaveConversation(conversationId) {
    if (!this.isConnected) return false;
    
    this.socket.emit('leave_conversation', { conversationId });
    console.log('🔗 Leaving conversation:', conversationId);
    return true;
  }

  reconnect() {
    if (this.socket) {
      console.log('🔄 Attempting to reconnect...');
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService; 