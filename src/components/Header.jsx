import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { FaBell, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import ProfilePictureModal from './common/ProfilePictureModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { notificationCount } = useWebSocket();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);

  // Monitor online/offline status with auto-clearing notification
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotification(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotification(true);
      
      // Auto-clear the offline notification after 5 seconds
      setTimeout(() => {
        setShowOfflineNotification(false);
      }, 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 container-perfect py-4 shadow-lg border-b z-50 safe-area-padding ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-blue-600 border-blue-700'
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mobile-gap-md">
        <h1 className={`text-sm sm:text-lg font-bold truncate mr-2 sm:mr-4 ${
          isDark ? 'text-white' : 'text-white'
        }`}>
          Young Eagles PWA
        </h1>
        
        {isAuthenticated && user && (
          <div className="flex items-center space-x-2 sm:space-x-3 mobile-gap-md">
            {/* Notifications Bell - Only for parents */}
            {(user?.role === 'parent' || user?.userType === 'parent') && (
              <div className="flex-shrink-0">
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => 
                    `relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? (isDark ? 'bg-blue-600 text-white' : 'bg-white/20 text-white')
                        : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-white/80 hover:bg-white/20 hover:text-white')
                    }`
                  }
                >
                  <FaBell className="text-base sm:text-lg" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </NavLink>
              </div>
            )}

            {/* WiFi Status Indicator */}
            <div className={`
              flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg cursor-pointer
              ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white/20 hover:bg-white/30'}
              ${isOnline ? 'text-green-400' : 'text-red-400'}
              transition-all duration-300 hover:scale-105
            `}
            title={isOnline ? 'Online' : 'Offline'}
            >
              {isOnline ? <FaWifi className="w-3 h-3 sm:w-4 sm:h-4" /> : <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4" />}
            </div>
            
            {/* User Dropdown */}
            <div className="flex-shrink-0">
              <UserDropdown onLogout={logout} />
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Picture Modal */}
      <ProfilePictureModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      
      {/* Offline Notification Toast */}
      {showOfflineNotification && (
        <div className={`
          fixed top-16 left-4 right-4 z-50 p-3 rounded-lg shadow-lg border-l-4 border-red-500
          ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}
          transform transition-all duration-300 ease-in-out
          ${showOfflineNotification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        `}>
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 w-4 h-4 mr-3 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-semibold text-sm">You're currently offline</p>
              <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Some features may not work until you reconnect
              </p>
            </div>
            <button
              onClick={() => setShowOfflineNotification(false)}
              className='ml-3 text-gray-400 hover:text-gray-600 transition-colors'
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
