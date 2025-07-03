import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaBell, FaRobot } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Navigation = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
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
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t transition-colors rounded-t-2xl ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => 
              `flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive 
                  ? (isDark ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50')
                  : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800')
              }`
            }
          >
            <Icon className="text-xl mb-1" />
            <span className="text-xs font-medium text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation; 