import apiService from './apiService';

class PushNotificationService {
  constructor() {
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    this.subscription = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check if push notifications are supported
  isSupported() {
    return this.isSupported;
  }

  // Convert VAPID key to Uint8Array (required for subscription)
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

  // Request permission for push notifications with enhanced UX
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    // Check current permission status
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission with better timing
      permission = await Notification.requestPermission();
    }
    
    if (permission === 'granted') {
      console.log('✅ Push notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ Push notification permission denied');
      // Show user-friendly message about enabling notifications
      this.showPermissionDeniedMessage();
      return false;
    } else {
      console.log('⏳ Push notification permission dismissed');
      return false;
    }
  }

  // Show user-friendly message when permission is denied
  showPermissionDeniedMessage() {
    if (window.confirm('Push notifications are disabled. Would you like to enable them to receive important updates? Click OK to learn how.')) {
      // Provide instructions for enabling notifications
      alert('To enable notifications:\n\n1. Click the lock icon in your browser\'s address bar\n2. Change "Notifications" to "Allow"\n3. Refresh the page\n\nOr check your browser settings for notification permissions.');
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    try {
      if (!this.vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const permission = await this.requestPermission();
      if (!permission) {
        throw new Error('Push notification permission denied');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = subscription;

      // Send subscription to backend
      try {
        await apiService.push.subscribe(subscription);
        console.log('✅ Push subscription registered with backend');
      } catch (error) {
        console.warn('⚠️ Failed to register push subscription with backend:', error);
      }

      return subscription;
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        try {
          await apiService.push.unsubscribe(subscription.endpoint);
          console.log('✅ Push subscription removed from backend');
        } catch (error) {
          console.warn('⚠️ Failed to remove push subscription from backend:', error);
        }
      }
      
      this.subscription = null;
      return true;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Get current subscription
  async getSubscription() {
    if (!this.isSupported) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('❌ Failed to get push subscription:', error);
      return null;
    }
  }

  // Check if currently subscribed
  async isSubscribed() {
    const subscription = await this.getSubscription();
    return !!subscription;
  }

  // Get VAPID public key from backend (fallback)
  async getVapidPublicKey() {
    try {
      const response = await apiService.push.getVapidPublicKey();
      return response.data.publicKey;
    } catch (error) {
      console.warn('⚠️ Failed to get VAPID key from backend, using environment variable');
      return this.vapidPublicKey;
    }
  }

  // Show a local notification (for testing)
  showLocalNotification(title, options = {}) {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto-close after 5 seconds if not interacted with
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } else {
      console.warn('Notification permission not granted');
    }
  }

  // Test push notification functionality
  async testPushNotification() {
    try {
      console.log('🧪 Testing push notification functionality...');
      
      // Check if subscribed
      const isSubscribed = await this.isSubscribed();
      if (!isSubscribed) {
        console.log('📱 Not subscribed to push notifications. Subscribing...');
        await this.subscribe();
      }

      // Send test notification via API
      const response = await apiService.push.sendTest();
      console.log('✅ Test notification sent:', response);
      
      // Also show local notification for immediate feedback
      this.showLocalNotification('Test Notification', {
        body: 'This is a test notification from Young Eagles!',
        tag: 'test-notification'
      });

      return true;
    } catch (error) {
      console.error('❌ Push notification test failed:', error);
      throw error;
    }
  }

  // Get notification settings and status
  async getNotificationStatus() {
    return {
      isSupported: this.isSupported,
      permission: Notification.permission,
      isSubscribed: await this.isSubscribed(),
      subscription: await this.getSubscription()
    };
  }
}

export default new PushNotificationService();
