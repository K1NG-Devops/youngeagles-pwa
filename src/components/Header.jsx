import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaBell } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import ProfilePictureModal from './common/ProfilePictureModal';
import apiService from '../services/apiService';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await apiService.notifications.getUnreadCount();
        setUnreadCount(response.data.count || 0);
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock notification count:', error);
        setUnreadCount(2); // Mock 2 unread notifications
      }
    };

    if (user?.role === 'parent' || user?.userType === 'parent') {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className={`fixed top-0 left-0 right-0 container-perfect py-4 shadow-lg border-b z-50 safe-area-padding ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-blue-600 border-blue-700'
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-gap-md">
        <h1 className={`text-lg sm:text-xl font-bold truncate mr-4 ${
          isDark ? 'text-white' : 'text-white'
        }`}>
          Young Eagles PWA
        </h1>
        
        {isAuthenticated && user && (
          <div className="flex items-center mobile-gap-md">
            {/* Notifications Bell - Only for parents */}
            {(user?.role === 'parent' || user?.userType === 'parent') && (
              <div className="flex-shrink-0 mr-3">
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => 
                    `relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? (isDark ? 'bg-blue-600 text-white' : 'bg-white/20 text-white')
                        : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-white/80 hover:bg-white/20 hover:text-white')
                    }`
                  }
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              </div>
            )}
            
            {/* User Dropdown - Only one profile picture */}
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
    </header>
  );
};

export default Header;
