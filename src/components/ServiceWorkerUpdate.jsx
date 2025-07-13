import React, { useEffect, useState } from 'react';
import { FaSync, FaDownload, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ServiceWorkerUpdate = () => {
  const { isDark } = useTheme();
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      initializeServiceWorker();
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      
      // Check for updates more frequently
      const updateCheckInterval = setInterval(() => {
        if (registration) {
          registration.update();
        }
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(updateCheckInterval);
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [registration]);

  const initializeServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      setRegistration(reg);
      
      // Check if there's already a waiting worker
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowUpdate(true);
      }

      // Listen for new workers
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        }
      });
      
      // Listen for controlling service worker changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
      
    } catch (error) {
      console.error('Service Worker initialization failed:', error);
    }
  };

  const handleServiceWorkerMessage = (event) => {
    const { data } = event;
    
    if (data && data.type === 'SW_UPDATED') {
      console.log('Service Worker updated:', data.message);
      if (!showUpdate) {
        setShowUpdate(true);
      }
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      if (waitingWorker) {
        // Tell waiting service worker to skip waiting
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } else if (registration) {
        // Force update check
        await registration.update();
      }
      
      // Small delay to ensure service worker is ready
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto transform transition-all duration-300">
      <div className={`rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FaDownload className="text-blue-500 text-sm" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                App Update Available
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                A new version is ready. Update now for the latest features and improvements.
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 p-1 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
          
          {/* Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isUpdating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isUpdating ? (
                <>
                  <FaSync className="animate-spin mr-2 text-xs" />
                  Updating...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2 text-xs" />
                  Update Now
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdate;
