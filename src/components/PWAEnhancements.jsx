import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import nativeNotificationService from '../services/nativeNotificationService';

const PWAEnhancements = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install prompt after a delay if not already standalone
      if (!isStandalone) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 30000); // Show after 30 seconds
      }
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      nativeNotificationService.success('Connection restored!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      nativeNotificationService.info('You are now offline. Some features may be limited.');
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      nativeNotificationService.success('App installed successfully!');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // Handle install app
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        nativeNotificationService.success('App installation started!');
      } else {
        nativeNotificationService.info('App installation cancelled');
      }
      
      // Clean up
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install prompt error:', error);
      nativeNotificationService.error('Unable to install app');
    }
  };

  // Handle dismiss install prompt
  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if install prompt should be shown
  const shouldShowInstallPrompt = () => {
    if (isStandalone || !isInstallable || !showInstallPrompt) return false;
    return !sessionStorage.getItem('pwa-install-dismissed');
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-red-900' : 'bg-red-600'} text-white p-2 text-center text-sm`}>
          <div className="flex items-center justify-center space-x-2">
            <FaExclamationTriangle className="text-xs" />
            <span>You're offline - Some features may be limited</span>
          </div>
        </div>
      )}

      {/* Install App Prompt */}
      {shouldShowInstallPrompt() && (
        <div className={`fixed bottom-4 left-4 right-4 z-50 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-full">
                <FaDownload className="text-white text-sm" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Install Young Eagles App
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Get the full experience with offline access
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallApp}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <FaTimes className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAEnhancements; 