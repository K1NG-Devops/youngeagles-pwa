import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.userId = null;
    this.userRole = null;
  }

  connect(userId, userRole, token) {
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    this.userId = userId;
    this.userRole = userRole;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: {
        token: token,
        userId: userId,
        userRole: userRole
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Join user-specific room
        this.socket.emit('join-user-room', { userId, userRole });
        
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts === 0) {
          reject(error);
        }
        
        this.handleReconnect();
      });

      this.socket.on('reconnect', () => {
        console.log('WebSocket reconnected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Re-join user room after reconnection
        if (this.userId && this.userRole) {
          this.socket.emit('join-user-room', { 
            userId: this.userId, 
            userRole: this.userRole 
          });
        }
      });

      // Set up default event listeners
      this.setupDefaultListeners();
    });
  }

  setupDefaultListeners() {
    // Listen for notification updates
    this.socket.on('notification-unread-count', (data) => {
      this.emit('notification-unread-count', data);
    });

    this.socket.on('new-notification', (data) => {
      this.emit('new-notification', data);
    });

    // Listen for profile updates
    this.socket.on('profile-updated', (data) => {
      this.emit('profile-updated', data);
    });

    // Listen for subscription updates
    this.socket.on('subscription-updated', (data) => {
      this.emit('subscription-updated', data);
    });

    // Listen for homework updates
    this.socket.on('homework-updated', (data) => {
      this.emit('homework-updated', data);
    });

    // Listen for attendance updates
    this.socket.on('attendance-updated', (data) => {
      this.emit('attendance-updated', data);
    });

    // Listen for class updates
    this.socket.on('class-updated', (data) => {
      this.emit('class-updated', data);
    });

    // Listen for payment updates
    this.socket.on('payment-updated', (data) => {
      this.emit('payment-updated', data);
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.userId = null;
    this.userRole = null;
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket && this.socket.connected && this.isConnected;
  }

  // Request methods
  requestNotificationCount() {
    if (this.isSocketConnected()) {
      this.socket.emit('request-notification-count');
    }
  }

  requestProfileUpdate() {
    if (this.isSocketConnected()) {
      this.socket.emit('request-profile-update');
    }
  }

  markNotificationAsRead(notificationId) {
    if (this.isSocketConnected()) {
      this.socket.emit('mark-notification-read', { notificationId });
    }
  }

  markAllNotificationsAsRead() {
    if (this.isSocketConnected()) {
      this.socket.emit('mark-all-notifications-read');
    }
  }

  // Send typing indicator for messaging
  sendTypingIndicator(recipientId, isTyping) {
    if (this.isSocketConnected()) {
      this.socket.emit('typing-indicator', { recipientId, isTyping });
    }
  }

  // Send message read receipt
  sendMessageReadReceipt(messageId) {
    if (this.isSocketConnected()) {
      this.socket.emit('message-read-receipt', { messageId });
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
