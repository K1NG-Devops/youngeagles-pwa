import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaRobot } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

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
        { path: '/events', icon: FaCalendarAlt, label: 'Events' }
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
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t transition-colors touch-responsive safe-area-bottom ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-around px-1 py-2 mobile-gap-sm">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => 
              `relative flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-responsive mobile-gap-xs hover-lift ${
                isActive 
                  ? (isDark ? 'text-blue-400 bg-blue-900/20 transform scale-105' : 'text-blue-600 bg-blue-50 transform scale-105')
                  : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800')
              }`
            }
          >
            <Icon className="text-base mb-0.5 transition-transform duration-200" />
            <span className="text-xs font-medium text-center truncate w-full">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation; 