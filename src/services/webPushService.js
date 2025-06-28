import { API_CONFIG, buildUrl } from '../config/api.js';
import httpClient from './httpClient.js';

class WebPushService {
  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BKd3dGhiUInAiSEgMIIBCgKCAQEAuR4K9QAAAD';
    this.registration = null;
    this.subscription = null;
    this.isSupported = false;
    this.isSubscribed = false;
    
    this.init();
  }

  async init() {
    console.log('🔔 Initializing Web Push Service...');
    
    // Check if service workers and push messaging are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported');
      return;
    }

    if (!('PushManager' in window)) {
      console.warn('⚠️ Push messaging not supported');
      return;
    }

    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return;
    }

    this.isSupported = true;
    console.log('✅ Web Push API is supported');

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered');

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      if (this.subscription) {
        this.isSubscribed = true;
        console.log('✅ Already subscribed to push notifications');
        
        // Sync subscription with backend
        await this.syncSubscriptionWithServer();
      }
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Web Push not supported');
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    console.log(`🔔 Notification permission ${granted ? 'granted' : 'denied'}`);
    return granted;
  }

  async subscribe() {
    if (!this.isSupported) {
      throw new Error('Web Push not supported');
    }

    if (this.isSubscribed) {
      console.log('✅ Already subscribed');
      return this.subscription;
    }

    // Request permission first
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    try {
      // Create subscription
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.isSubscribed = true;
      console.log('✅ Subscribed to push notifications');

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      console.log('💡 Not subscribed to push notifications');
      return;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove subscription from server
      await this.removeSubscriptionFromServer(this.subscription);
      
      this.subscription = null;
      this.isSubscribed = false;
      
      console.log('✅ Unsubscribed from push notifications');
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await httpClient.post('/api/notifications/subscribe', {
        subscription: subscription,
        userId: user.id,
        userType: user.role,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      });

      console.log('✅ Subscription sent to server');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await httpClient.delete('/api/notifications/unsubscribe', {
        data: {
          subscription: subscription,
          userId: user.id
        }
      });

      console.log('✅ Subscription removed from server');
    } catch (error) {
      console.error('❌ Failed to remove subscription from server:', error);
      // Don't throw here - local unsubscribe should still work
    }
  }

  async syncSubscriptionWithServer() {
    if (!this.subscription) return;

    try {
      await this.sendSubscriptionToServer(this.subscription);
    } catch (error) {
      console.error('❌ Failed to sync subscription with server:', error);
    }
  }

  // Test push notification
  async sendTestNotification() {
    if (!this.isSubscribed) {
      throw new Error('Not subscribed to push notifications');
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await httpClient.post('/api/notifications/send-test', {
        userId: user.id,
        message: 'Test notification from Young Eagles PWA'
      });

      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('❌ Failed to send test notification:', error);
      throw error;
    }
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show local notification (for testing)
  async showLocalNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.warn('⚠️ Cannot show notification - no permission');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Get subscription status
  getStatus() {
    return {
      isSupported: this.isSupported,
      isSubscribed: this.isSubscribed,
      permission: Notification.permission,
      subscription: this.subscription
    };
  }
}

// Create singleton instance
const webPushService = new WebPushService();

export default webPushService;
