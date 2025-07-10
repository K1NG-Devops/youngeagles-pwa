/**
 * Native Notification Service
 * Uses device's native notification and popup styles
 */

class NativeNotificationService {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Browser does not support notifications');
      return;
    }

    // Request permission if not already granted
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  /**
   * Show native browser notification
   */
  async showNotification(title, options = {}) {
    if (!this.isSupported) {
      // Fallback to console for unsupported browsers
      console.log(`Notification: ${title}`, options.body);
      return;
    }

    if (this.permission !== 'granted') {
      // Try to request permission one more time
      this.permission = await Notification.requestPermission();
      if (this.permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'young-eagles-app',
      renotify: true,
      requireInteraction: false,
      ...options
    });

    // Auto-close after 5 seconds for non-persistent notifications
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    return notification;
  }

  /**
   * Show success notification
   */
  success(title, message = '') {
    return this.showNotification(title, {
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'success'
    });
  }

  /**
   * Show error notification
   */
  error(title, message = '') {
    return this.showNotification(title, {
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'error',
      requireInteraction: true
    });
  }

  /**
   * Show info notification
   */
  info(title, message = '') {
    return this.showNotification(title, {
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'info'
    });
  }

  /**
   * Show warning notification
   */
  warning(title, message = '') {
    return this.showNotification(title, {
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'warning',
      requireInteraction: true
    });
  }

  /**
   * Native confirm dialog
   */
  confirm(message, title = 'Confirm') {
    return window.confirm(title ? `${title}\n\n${message}` : message);
  }

  /**
   * Native alert dialog
   */
  alert(message, title = 'Alert') {
    return window.alert(title ? `${title}\n\n${message}` : message);
  }

  /**
   * Native prompt dialog
   */
  prompt(message, defaultValue = '', title = 'Input') {
    return window.prompt(title ? `${title}\n\n${message}` : message, defaultValue);
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported() {
    return this.isSupported;
  }
}

// Create singleton instance
const nativeNotificationService = new NativeNotificationService();

export default nativeNotificationService; 