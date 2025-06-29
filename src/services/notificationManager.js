import websocketService from './websocketService.js';
import webPushService from './webPushService.js';
import { showTopNotification } from '../utils/notifications.js';

/**
 * Hybrid Notification Manager
 * 
 * This service coordinates between:
 * - Socket.IO: For real-time, in-app notifications when the user is active
 * - Web Push API: For background notifications when the app is not in focus
 * 
 * It provides a unified interface for notification handling across the app.
 */
class NotificationManager {
  constructor() {
    this.isAppVisible = true;
    this.isAppFocused = true;
    this.notificationQueue = [];
    this.preferences = {
      soundEnabled: true,
      vibrationEnabled: true,
      showInApp: true,
      showBackground: true
    };
    
    this.init();
  }

  async init() {
    console.log('🔔 Initializing Notification Manager...');
    
    // Set up visibility change detection
    this.setupVisibilityTracking();
    
    // Set up WebSocket event listeners for notifications
    this.setupWebSocketNotifications();
    
    // Load user preferences
    this.loadPreferences();
    
    console.log('✅ Notification Manager initialized');
  }

  setupVisibilityTracking() {
    // Track app visibility for notification routing decisions
    document.addEventListener('visibilitychange', () => {
      this.isAppVisible = !document.hidden;
      console.log(`👁️ App visibility changed: ${this.isAppVisible ? 'visible' : 'hidden'}`);
      
      if (this.isAppVisible) {
        // Process any queued notifications when app becomes visible
        this.processNotificationQueue();
      }
    });

    // Track window focus
    window.addEventListener('focus', () => {
      this.isAppFocused = true;
      console.log('🎯 App focused');
    });

    window.addEventListener('blur', () => {
      this.isAppFocused = false;
      console.log('🎯 App blurred');
    });
  }

  setupWebSocketNotifications() {
    // Listen for real-time notifications via Socket.IO
    websocketService.subscribe('notification', (notification) => {
      this.handleNotification(notification, 'websocket');
    });

    websocketService.subscribe('new_message', (message) => {
      this.handleMessageNotification(message);
    });

    // Listen for system events
    websocketService.subscribe('connected', () => {
      this.showNotification('Connected to messaging service', 'success', { temporary: true });
    });

    websocketService.subscribe('disconnected', () => {
      this.showNotification('Disconnected from messaging service', 'warning', { temporary: true });
    });
  }

  async handleNotification(notification, source = 'unknown') {
    console.log(`🔔 Handling notification from ${source}:`, notification);

    const notificationData = {
      id: notification.id || Date.now(),
      title: notification.title || notification.message,
      body: notification.body || notification.message,
      type: notification.type || 'info',
      source,
      timestamp: notification.timestamp || new Date().toISOString(),
      data: notification.data || {}
    };

    // Route notification based on app state
    if (this.isAppVisible && this.isAppFocused) {
      // App is active - show in-app notification
      this.showInAppNotification(notificationData);
    } else {
      // App is not active - queue for background notification
      this.queueBackgroundNotification(notificationData);
    }

    // Always store in notification history
    this.addToHistory(notificationData);
  }

  handleMessageNotification(message) {
    const notification = {
      id: `message_${message.id}`,
      title: `New message from ${message.senderName || 'Someone'}`,
      body: message.message,
      type: 'message',
      source: 'websocket',
      timestamp: message.createdAt || new Date().toISOString(),
      data: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        messageId: message.id
      }
    };

    this.handleNotification(notification, 'websocket');
  }

  showInAppNotification(notification) {
    if (!this.preferences.showInApp) {
      console.log('💡 In-app notifications disabled');
      return;
    }

    console.log('📱 Showing in-app notification:', notification.title);
    
    // Use the existing top notification system
    showTopNotification(notification.title, notification.type, {
      duration: 5000,
      showCloseButton: true
    });

    // Play sound if enabled
    if (this.preferences.soundEnabled) {
      this.playNotificationSound();
    }

    // Vibrate if enabled and supported
    if (this.preferences.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  async queueBackgroundNotification(notification) {
    if (!this.preferences.showBackground) {
      console.log('💡 Background notifications disabled');
      return;
    }

    console.log('🔔 Queueing background notification:', notification.title);
    this.notificationQueue.push(notification);

    // Try to send via Web Push immediately
    await this.sendBackgroundNotification(notification);
  }

  async sendBackgroundNotification(notification) {
    try {
      // Check if Web Push is available and subscribed
      const pushStatus = webPushService.getStatus();
      
      if (!pushStatus.isSupported) {
        console.log('💡 Web Push not supported - using local notification');
        return this.showLocalNotification(notification);
      }

      if (!pushStatus.isSubscribed) {
        console.log('💡 Not subscribed to push notifications - using local notification');
        return this.showLocalNotification(notification);
      }

      // Send via server-side push (backend will handle the actual push)
      console.log('📤 Sending server-side push notification');
      // Note: This would be handled by your backend API
      // For now, fall back to local notification
      return this.showLocalNotification(notification);

    } catch (error) {
      console.error('❌ Failed to send background notification:', error);
      // Fall back to local notification
      return this.showLocalNotification(notification);
    }
  }

  async showLocalNotification(notification) {
    try {
      return await webPushService.showLocalNotification(notification.title, {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        renotify: true,
        requireInteraction: false,
        data: notification.data
      });
    } catch (error) {
      console.error('❌ Failed to show local notification:', error);
    }
  }

  processNotificationQueue() {
    if (this.notificationQueue.length === 0) return;

    console.log(`📥 Processing ${this.notificationQueue.length} queued notifications`);
    
    // Show summary notification for multiple queued items
    if (this.notificationQueue.length > 1) {
      this.showInAppNotification({
        title: `${this.notificationQueue.length} new notifications`,
        body: 'Tap to view all notifications',
        type: 'info'
      });
    } else {
      // Show single notification
      this.showInAppNotification(this.notificationQueue[0]);
    }

    // Clear queue
    this.notificationQueue = [];
  }

  playNotificationSound() {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('💡 Could not play notification sound:', error.message);
    }
  }

  // Notification history management
  addToHistory(notification) {
    try {
      const history = this.getNotificationHistory();
      history.unshift(notification);
      
      // Keep only last 50 notifications
      const trimmedHistory = history.slice(0, 50);
      
      localStorage.setItem('notification_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('❌ Failed to save notification to history:', error);
    }
  }

  getNotificationHistory() {
    try {
      const history = localStorage.getItem('notification_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('❌ Failed to load notification history:', error);
      return [];
    }
  }

  clearNotificationHistory() {
    try {
      localStorage.removeItem('notification_history');
      console.log('✅ Notification history cleared');
    } catch (error) {
      console.error('❌ Failed to clear notification history:', error);
    }
  }

  // Preference management
  loadPreferences() {
    try {
      const prefs = localStorage.getItem('notification_preferences');
      if (prefs) {
        this.preferences = { ...this.preferences, ...JSON.parse(prefs) };
      }
      console.log('📋 Loaded notification preferences:', this.preferences);
    } catch (error) {
      console.error('❌ Failed to load notification preferences:', error);
    }
  }

  updatePreferences(newPreferences) {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
      console.log('✅ Updated notification preferences:', this.preferences);
    } catch (error) {
      console.error('❌ Failed to save notification preferences:', error);
    }
  }

  // Public API
  async enablePushNotifications() {
    try {
      await webPushService.subscribe();
      this.updatePreferences({ showBackground: true });
      this.showNotification('Push notifications enabled', 'success');
      return true;
    } catch (error) {
      console.error('❌ Failed to enable push notifications:', error);
      this.showNotification('Failed to enable push notifications', 'error');
      return false;
    }
  }

  async disablePushNotifications() {
    try {
      await webPushService.unsubscribe();
      this.updatePreferences({ showBackground: false });
      this.showNotification('Push notifications disabled', 'info');
      return true;
    } catch (error) {
      console.error('❌ Failed to disable push notifications:', error);
      return false;
    }
  }

  // Convenience method for manual notifications
  showNotification(message, type = 'info', options = {}) {
    const notification = {
      id: Date.now(),
      title: message,
      body: '',
      type,
      source: 'manual',
      timestamp: new Date().toISOString(),
      data: {}
    };

    if (options.temporary) {
      // Just show in-app, don't add to history
      this.showInAppNotification(notification);
    } else {
      this.handleNotification(notification, 'manual');
    }
  }

  // Test functions
  async sendTestNotification() {
    try {
      await webPushService.sendTestNotification();
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      this.showNotification('Test notification failed', 'error');
    }
  }

  getStatus() {
    const pushStatus = webPushService.getStatus();
    
    return {
      websocket: {
        connected: websocketService.isConnected,
        userId: websocketService.userId
      },
      webPush: pushStatus,
      app: {
        visible: this.isAppVisible,
        focused: this.isAppFocused
      },
      preferences: this.preferences,
      queueSize: this.notificationQueue.length
    };
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
