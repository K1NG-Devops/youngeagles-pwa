import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaBell, FaDownload, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const NativeAppEnhancements = () => {
  const { isDark } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationPromptDismissed, setNotificationPromptDismissed] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
      
      // Auto-hide offline toast after 5 seconds
      setTimeout(() => setShowOfflineToast(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt if not already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (!isStandalone && !isIOS) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
    
    // Check if user has previously dismissed the notification prompt
    const dismissed = localStorage.getItem('notificationPromptDismissed') === 'true';
    setNotificationPromptDismissed(dismissed);
  }, []);

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  // Dismiss notification prompt
  const dismissNotificationPrompt = () => {
    setNotificationPromptDismissed(true);
    // Store in localStorage to remember dismissal across sessions
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setHasNotificationPermission(permission === 'granted');
        
        if (permission === 'granted') {
          // Hide the notification prompt after successful permission
          setNotificationPromptDismissed(true);
          
          // Optional: Show a success notification
          new Notification('Young Eagles', {
            body: 'Notifications enabled! You\'ll now receive homework and announcement updates.',
            icon: '/icon-192x192.png'
          });
        } else if (permission === 'denied') {
          console.log('Notification permission denied');
          setNotificationPromptDismissed(true);
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  return (
    <>
      {/* Offline Status Toast */}
      {showOfflineToast && (
        <div className={`
          fixed top-4 left-4 right-4 z-[9999] mx-auto max-w-sm
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          border ${isDark ? 'border-gray-700' : 'border-gray-200'}
          rounded-lg shadow-lg p-4 flex items-center space-x-3
          animate-slideDown
        `}>
          <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">You're offline</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Some features may be limited
            </p>
          </div>
          <button
            onClick={() => setShowOfflineToast(false)}
            className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className={`
          fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm
          ${isDark ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900'}
          border ${isDark ? 'border-blue-700' : 'border-blue-200'}
          rounded-lg shadow-lg p-4
          animate-slideUp
        `}>
          <div className="flex items-start space-x-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${isDark ? 'bg-blue-800' : 'bg-blue-100'}
            `}>
              <FaDownload className="text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">Install Young Eagles</h3>
              <p className={`text-xs mb-3 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                Get the full app experience with offline access and notifications
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstallClick}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-colors
                    ${isDark 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
                  `}
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className={`
                    px-3 py-1 rounded text-xs transition-colors
                    ${isDark 
          ? 'text-blue-300 hover:bg-blue-800' 
          : 'text-blue-600 hover:bg-blue-100'
        }
                  `}
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {!hasNotificationPermission && !notificationPromptDismissed && 'Notification' in window && (
        <div className={`
          fixed top-16 left-4 right-4 z-[9998] mx-auto max-w-sm
          ${isDark ? 'bg-purple-900 text-white' : 'bg-purple-50 text-purple-900'}
          border ${isDark ? 'border-purple-700' : 'border-purple-200'}
          rounded-lg shadow-lg p-4
          animate-slideDown
        `}>
          <div className="flex items-start space-x-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${isDark ? 'bg-purple-800' : 'bg-purple-100'}
            `}>
              <FaBell className="text-purple-500 text-sm" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">Enable Notifications</h3>
              <p className={`text-xs mb-2 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                Stay updated with homework and announcements
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={requestNotificationPermission}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-colors
                    ${isDark 
          ? 'bg-purple-600 text-white hover:bg-purple-700' 
          : 'bg-purple-600 text-white hover:bg-purple-700'
        }
                  `}
                >
                  Enable
                </button>
                <button
                  onClick={dismissNotificationPrompt}
                  className={`
                    px-3 py-1 rounded text-xs transition-colors
                    ${isDark 
          ? 'text-purple-300 hover:bg-purple-800' 
          : 'text-purple-600 hover:bg-purple-100'
        }
                  `}
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismissNotificationPrompt}
              className={`p-1 rounded ${isDark ? 'hover:bg-purple-800' : 'hover:bg-purple-100'}`}
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default NativeAppEnhancements;
