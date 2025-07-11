import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaBell, FaChild, FaBars, FaTimes, FaUsers, FaBullhorn, FaBookOpen, FaChalkboardTeacher, FaUpload } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const FloatingNavigation = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('floatingNavPosition');
    return saved ? JSON.parse(saved) : { bottom: 24, right: 24 };
  });
  const floatRef = useRef(null);

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  // Handle clicks outside the floating nav to close it
  useEffect(() => {
    const handleClickOutside = event => {
      if (floatRef.current && !floatRef.current.contains(event.target)) {
        setIsExpanded(false); 
      }
    };

    if (isExpanded) {
      // Add a small delay to prevent immediate closing
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isExpanded]);

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'bg-blue-500' }
    ];

    if (user?.role === 'parent' || user?.userType === 'parent') {
      return [
        ...baseItems,
        { path: '/children', icon: FaChild, label: 'My Children', color: 'bg-green-500' },
        { path: '/payment-proofs', icon: FaUpload, label: 'Submit POP', color: 'bg-yellow-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' },
        { path: '/notifications', icon: FaBell, label: 'Announcements', color: 'bg-red-500' }
      ];
    } else if (user?.role === 'teacher' || user?.userType === 'teacher') {
      return [
        ...baseItems,
        { path: '/classes', icon: FaChalkboardTeacher, label: 'Classroom', color: 'bg-green-500' },
        { path: '/homework', icon: FaBookOpen, label: 'Assignments', color: 'bg-indigo-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' }
      ];
    } else if (user?.role === 'admin' || user?.userType === 'admin') {
      return [
        ...baseItems,
        { path: '/management', icon: FaUsers, label: 'Program Management', color: 'bg-green-500' },
        { path: '/notifications', icon: FaBullhorn, label: 'Announcements', color: 'bg-purple-500' },
        { path: '/classes', icon: FaChalkboardTeacher, label: 'Classrooms', color: 'bg-orange-500' }
      ];
    }
    return baseItems;
  };

  const navItems = getNavItems();

  // Close menu when navigating to a page
  const handleNavClick = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-50"
          onClick={handleToggle}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Floating Navigation Items */}
      <div
        ref={floatRef}
        className="fixed z-[9999] select-none"
        style={{
          bottom: `${position.bottom}px`,
          right: `${position.right}px`
        }}
      >
        <div className="flex flex-col-reverse items-end gap-3">
          {/* Navigation Items */}
          {isExpanded && navItems.map(({ path, icon: Icon, label, color }, index) => (
            <div 
              key={path} 
              className="flex items-center gap-3 animate-fadeInUp"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              {/* Label */}
              <div className={`px-3 py-2 rounded-lg shadow-lg whitespace-nowrap ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {label}
                </span>
              </div>

              {/* Icon Button */}
              <NavLink
                to={path}
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `w-12 h-12 rounded-full ${color} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                    isActive ? 'ring-4 ring-white ring-opacity-40 scale-105' : ''
                  }`
                }
              >
                <Icon className="text-white text-lg" />
              </NavLink>
            </div>
          ))}

          {/* Main FAB Button */}
          <button
            onClick={handleToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
              isExpanded 
                ? 'bg-red-500 rotate-45 scale-105' 
                : isDark 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isExpanded ? (
              <FaTimes className="text-white text-xl" />
            ) : (
              <FaBars className="text-white text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default FloatingNavigation;
