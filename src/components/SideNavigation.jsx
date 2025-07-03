import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaBell, FaRobot, FaBars, FaTimes, FaUser, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const SideNavigation = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
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

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-3 rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600' 
            : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-lg'
        }`}
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-xl`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDark ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.role === 'parent' ? 'Parent' : user?.role === 'teacher' ? 'Teacher' : 'Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={toggleSidebar}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100')
                  }`
                }
              >
                <Icon className="text-xl mr-4" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <NavLink
            to="/settings"
            onClick={toggleSidebar}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors mb-2 ${
              isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaCog className="text-xl mr-4" />
            <span className="font-medium">Settings</span>
          </NavLink>
          <button
            onClick={() => {
              logout();
              toggleSidebar();
            }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <FaTimes className="text-xl mr-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideNavigation; 