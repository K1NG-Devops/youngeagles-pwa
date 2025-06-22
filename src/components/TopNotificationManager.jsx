import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const TopNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  // Listen for custom notification events
  useEffect(() => {
    const handleTopNotification = (event) => {
      const { message, type = 'info', duration = 4000 } = event.detail;
      
      const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto remove after duration
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    };

    window.addEventListener('showTopNotification', handleTopNotification);
    
    return () => {
      window.removeEventListener('showTopNotification', handleTopNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-white" />;
      case 'error':
        return <FaTimes className="text-white" />;
      case 'warning':
        return <FaExclamationTriangle className="text-white" />;
      default:
        return <FaInfoCircle className="text-white" />;
    }
  };

  const getNotificationColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      case 'warning':
        return 'bg-orange-500 border-orange-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="flex flex-col items-center pt-4 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-center space-x-3 px-6 py-3 rounded-lg shadow-lg
              border-l-4 text-white font-medium max-w-sm mx-4
              pointer-events-auto transform transition-all duration-300
              animate-slideDown
              ${getNotificationColors(notification.type)}
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 text-sm">
              {notification.message}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper function to show top notifications from anywhere in the app
export const showTopNotification = (message, type = 'info', duration = 4000) => {
  const event = new CustomEvent('showTopNotification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default TopNotificationManager; 