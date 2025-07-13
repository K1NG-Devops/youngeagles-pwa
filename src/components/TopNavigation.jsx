import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaBell, FaRobot, FaUser, FaCog, FaSignOutAlt, FaChevronDown, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const TopNavigation = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard' }
    ];

    if (user?.role === 'parent') {
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework' },
        { path: '/activities', icon: FaRobot, label: 'Activities' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events' },
        { path: '/notifications', icon: FaBell, label: 'Updates' }
      ];
    } else {
      // For teachers and admin
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework' },
        { path: '/activities', icon: FaRobot, label: 'Activities' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events' }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo/Brand - Mobile Optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <FaGraduationCap className="text-white text-sm" />
            </div>
            <span className={`text-sm sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Young Eagles
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100')
                  }`
                }
              >
                <Icon className="text-sm mr-2" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side: WiFi indicator and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* WiFi Status Indicator - Now in header */}
            <div className={`
              flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg cursor-pointer
              ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
              ${isOnline ? 'text-green-500' : 'text-red-500'}
              transition-all duration-300 hover:scale-105
            `}
            title={isOnline ? 'Online' : 'Offline'}
            >
              {isOnline ? <FaWifi className="w-3 h-3" /> : <FaExclamationTriangle className="w-3 h-3" />}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <FaUser className="text-white text-xs sm:text-sm" />
                </div>
                {/* Hide username on mobile to save space */}
                <span className={`text-sm font-medium hidden md:block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </span>
                <FaChevronDown className="text-xs" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'User'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user?.role === 'parent' ? 'Parent' : user?.role === 'teacher' ? 'Teacher' : 'Admin'}
                    </p>
                  </div>
                
                  <NavLink
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaCog className="mr-3" />
                  Settings
                  </NavLink>
                
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                      isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <FaSignOutAlt className="mr-3" />
                  Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation - shows nav items in dropdown on smaller screens */}
          <div className="md:hidden relative">
            {/* Mobile menu would go here */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (visible on small screens) */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive 
                    ? (isDark ? 'text-blue-400' : 'text-blue-600')
                    : (isDark ? 'text-gray-400' : 'text-gray-600')
                }`
              }
            >
              <Icon className="text-lg mb-1" />
              <span className="text-xs font-medium text-center">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation; 