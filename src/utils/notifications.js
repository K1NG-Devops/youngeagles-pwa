// Global notification utility to replace toast notifications
// Uses the TopNotificationManager system

export const showNotification = (message, type = 'info', duration = 4000) => {
  const event = new CustomEvent('showTopNotification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

// Also export as showTopNotification for compatibility
export const showTopNotification = showNotification;

// Convenience methods for different notification types
export const showSuccess = (message, duration = 4000) => {
  showNotification(message, 'success', duration);
};

export const showError = (message, duration = 6000) => {
  showNotification(message, 'error', duration);
};

export const showWarning = (message, duration = 5000) => {
  showNotification(message, 'warning', duration);
};

export const showInfo = (message, duration = 4000) => {
  showNotification(message, 'info', duration);
};

// Toast replacement object for easy migration
export const toast = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  // For backward compatibility with existing code
  warn: showWarning
};

export default {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  toast
}; 